import 'server-only'

import type { Prisma } from '@prisma/client'

import { prisma } from '@/core/lib/db'
import { conflict, invalidInput } from '@/core/lib/errors'
import { readBodyText } from '@/core/lib/play'
import { after, countdownEnd } from '@/core/lib/play/clock'
import { shuffle } from '@/core/lib/play/croquis'
import { frenchWords } from '@/core/lib/play/dictionary'
import {
  checkWord,
  drawWord,
  nextGuesser,
  phaseOf,
  setterOf,
  suspensSettingsOf,
  wordOf,
} from '@/core/lib/play/suspens'
import type { SuspensWord } from '@/core/lib/play/suspens'
import { IDLE_STEP } from '@/core/engines/play/steps'
import { expireTurn } from '@/core/services/play/suspens/SuspensGuessService'
import { deadlineOf, movedStep, withTable } from '@/core/services/play/suspens/SuspensTable'
import type { SuspensTable } from '@/core/services/play/suspens/SuspensTable'
import { PLAY_ERRORS, SUSPENS_SETTINGS } from '@/declarations/play'
import type { EngineSession, EngineStep } from '@/types/play'
import { SuspensPhases } from '@/utils/constants/play'

/**
 * Words already played, capital form
 * @param {Prisma.TransactionClient | typeof prisma} client - Database
 * @param {string} sessionId - Game
 * @return {Promise<Set<string>>} - Words
 */

const playedWords = async (
  client: Prisma.TransactionClient | typeof prisma,
  sessionId: string
): Promise<Set<string>> => {
  const rows = await client.suspensRound.findMany({ where: { sessionId }, select: { word: true } })

  return new Set(rows.flatMap((row) => wordOf(row.word)?.word ?? []))
}

/**
 * Seat the table, open the first round on the choice of the first setter
 * @param {EngineSession} session - Game
 * @return {Promise<EngineStep>} - Step
 */

export const openTable = async (session: EngineSession): Promise<EngineStep> => {
  const settings = suspensSettingsOf(session.settings)
  const order = shuffle(session.players)
  const startsAt = countdownEnd(new Date(), SUSPENS_SETTINGS.countdownSeconds)
  const game = await prisma.suspensGame.create({
    data: {
      sessionId: session.id,
      round: 1,
      rounds: order.length * settings.laps,
      order,
      setterId: order[0],
      tried: [],
      startsAt,
      pickEndsAt: after(startsAt, settings.pickSeconds),
    },
  })

  return movedStep(game)
}

/**
 * Final scores written on the seats
 * @param {SuspensTable} table - Locked table
 * @return {Promise<EngineStep>} - Finished step
 */

const closeTable = async ({ tx, session }: SuspensTable): Promise<EngineStep> => {
  const where = { sessionId: session.id }
  const [moves, rounds] = await Promise.all([
    tx.suspensMove.groupBy({ by: ['accountId'], where, _sum: { points: true } }),
    tx.suspensRound.groupBy({ by: ['setterId'], where, _sum: { points: true } }),
  ])

  for (const accountId of session.players) {
    const score =
      (moves.find((entry) => entry.accountId === accountId)?._sum.points ?? 0) +
      (rounds.find((entry) => entry.setterId === accountId)?._sum.points ?? 0)
    await tx.playSeat.update({
      where: { sessionId_accountId: { sessionId: session.id, accountId } },
      data: { score },
    })
  }

  return { changed: true, finished: true, deadline: null }
}

/**
 * The word is set: the first guesser after the setter takes the turn
 * @param {SuspensTable} table - Locked table
 * @param {SuspensWord} entry - Word chosen
 * @return {Promise<EngineStep>} - Step
 */

const startWord = async (table: SuspensTable, entry: SuspensWord): Promise<EngineStep> => {
  const { tx, session, settings, game, now } = table
  const turnId = nextGuesser(game.order as string[], game.setterId, session.players)
  const updated = await tx.suspensGame.update({
    where: { sessionId: session.id },
    data: {
      word: entry.word,
      display: entry.display,
      turnId,
      turnEndsAt: after(now, settings.turnSeconds),
    },
  })

  return movedStep(updated)
}

/**
 * Next setter and a table waiting for a word
 * @param {SuspensTable} table - Locked table
 * @return {Promise<EngineStep>} - Step
 */

const nextRound = async (table: SuspensTable): Promise<EngineStep> => {
  const { tx, session, settings, game, now } = table
  const round = game.round + 1
  const next = await tx.suspensGame.update({
    where: { sessionId: session.id },
    data: {
      round,
      setterId: setterOf(game.order as string[], round, session.players),
      word: null,
      display: null,
      tried: [],
      errors: 0,
      turnNo: 0,
      turnId: null,
      turnEndsAt: null,
      revealUntil: null,
      startsAt: now,
      pickEndsAt: after(now, settings.pickSeconds),
    },
  })

  return movedStep(next)
}

/**
 * Turn of a guesser who left, handed on without an error
 * @param {SuspensTable} table - Locked table
 * @return {Promise<EngineStep>} - Step
 */

const passGone = async (table: SuspensTable): Promise<EngineStep> => {
  const { tx, session, settings, game, now } = table
  const turnId = nextGuesser(game.order as string[], game.setterId, session.players, game.turnId)
  const updated = await tx.suspensGame.update({
    where: { sessionId: session.id },
    data: { turnId, turnEndsAt: after(now, settings.turnSeconds) },
  })

  return movedStep(updated)
}

/**
 * Play every overdue move of the table
 * @param {EngineSession} session - Game
 * @return {Promise<EngineStep>} - Step
 */

export const settleTable = (session: EngineSession): Promise<EngineStep> =>
  withTable(session, async (table) => {
    const { tx, game, now } = table
    const phase = phaseOf(game)
    const seated = session.players

    // The setter or the guesser walked away
    const isGone =
      (phase === SuspensPhases.Pick && !seated.includes(game.setterId)) ||
      (phase === SuspensPhases.Play && game.turnId !== null && !seated.includes(game.turnId))
    const deadline = deadlineOf(game)
    if (now < deadline && !isGone) return { ...IDLE_STEP, deadline }

    if (phase === SuspensPhases.Reveal) {
      return game.round >= game.rounds ? closeTable(table) : nextRound(table)
    }
    if (phase === SuspensPhases.Pick) {
      return startWord(table, drawWord(await playedWords(tx, session.id)))
    }

    // No penalty for a guesser who left
    return isGone && now < deadline ? passGone(table) : expireTurn(table)
  })

/**
 * Table open to the setter's choice
 * @param {SuspensTable} table - Locked table
 * @param {string} accountId - Player
 * @return {void}
 */

const requirePick = ({ game, now }: SuspensTable, accountId: string): void => {
  if (phaseOf(game) !== SuspensPhases.Pick) throw conflict(PLAY_ERRORS.notPicking)
  if (game.setterId !== accountId || now < game.startsAt || now >= game.pickEndsAt) {
    throw conflict(PLAY_ERRORS.notYourTurn)
  }
}

/**
 * The setter chooses the secret word
 * @param {EngineSession} session - Game
 * @param {string} accountId - Player
 * @param {Record<string, unknown>} raw - Body with the word
 * @return {Promise<EngineStep>} - Step
 */

export const pickWord = (
  session: EngineSession,
  accountId: string,
  raw: Record<string, unknown>
): Promise<EngineStep> => {
  const typed = readBodyText(raw, 'word', PLAY_ERRORS.emptyWord).slice(0, 40)

  return withTable(session, async (table) => {
    requirePick(table, accountId)
    const checked = checkWord(typed, await frenchWords())
    if ('error' in checked) {
      throw invalidInput([{ field: 'word', message: checked.error }], checked.error)
    }
    if ((await playedWords(table.tx, session.id)).has(checked.entry.word)) {
      throw invalidInput([{ field: 'word', message: PLAY_ERRORS.wordUsed }], PLAY_ERRORS.wordUsed)
    }

    return startWord(table, checked.entry)
  })
}

/**
 * The setter lets the game draw the word
 * @param {EngineSession} session - Game
 * @param {string} accountId - Player
 * @return {Promise<EngineStep>} - Step
 */

export const drawForSetter = (session: EngineSession, accountId: string): Promise<EngineStep> =>
  withTable(session, async (table) => {
    requirePick(table, accountId)

    return startWord(table, drawWord(await playedWords(table.tx, session.id)))
  })
