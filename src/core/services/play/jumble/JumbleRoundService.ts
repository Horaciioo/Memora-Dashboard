import 'server-only'

import type { JumbleGame, Prisma } from '@prisma/client'

import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import { readBodyText } from '@/core/lib/play'
import { normalizeWord } from '@/core/lib/play/baccalaureat/words'
import { after, countdownEnd } from '@/core/lib/play/clock'
import { frenchWords } from '@/core/lib/play/dictionary'
import { drawWord, isSolution, jumbleSettingsOf, pointsOf, scramble } from '@/core/lib/play/jumble'
import type { JumbleGameSettings } from '@/core/lib/play/jumble'
import { IDLE_STEP } from '@/core/engines/play/steps'
import { holdSession } from '@/core/services/play/PlaySessionService'
import { JUMBLE_SETTINGS, PLAY_ERRORS } from '@/declarations/play'
import type { EngineSession, EngineStep } from '@/types/play'
import { SECOND_MS } from '@/utils/constants/time'

// Locked table of a game
interface JumbleTable {
  tx: Prisma.TransactionClient
  session: EngineSession
  settings: JumbleGameSettings
  game: JumbleGame
  now: Date
}

/**
 * Clock of a round opening at a moment
 * @param {JumbleGameSettings} settings - Game settings
 * @param {Date} startsAt - Opening
 * @return {{ startsAt: Date, endsAt: Date, hintAt: Date }} - Round clock
 */

const clockOf = (settings: JumbleGameSettings, startsAt: Date) => ({
  startsAt,
  endsAt: after(startsAt, settings.roundSeconds),
  hintAt: after(startsAt, settings.roundSeconds * JUMBLE_SETTINGS.hintRatio),
})

/**
 * Next moment the table has to move
 * @param {JumbleGame} game - Table
 * @param {JumbleGameSettings} settings - Game settings
 * @return {Date} - Deadline
 */

const deadlineOf = (game: JumbleGame, settings: JumbleGameSettings): Date => {
  if (game.revealUntil) return game.revealUntil

  return settings.hasHint && !game.isHinted ? game.hintAt : game.endsAt
}

/**
 * Run work on the locked table
 * @param {EngineSession} session - Game
 * @param {(table: JumbleTable) => Promise<EngineStep>} work - Table work
 * @return {Promise<EngineStep>} - Step
 */

const withTable = (
  session: EngineSession,
  work: (table: JumbleTable) => Promise<EngineStep>
): Promise<EngineStep> =>
  prisma.$transaction(async (tx) => {
    await holdSession(tx, session.id)
    const game = await tx.jumbleGame.findUnique({ where: { sessionId: session.id } })
    if (!game) throw notFound(PLAY_ERRORS.roundMissing)

    return work({
      tx,
      session,
      settings: jumbleSettingsOf(session.settings),
      game,
      now: new Date(),
    })
  })

/**
 * Words already played, comparable form
 * @param {Prisma.TransactionClient | typeof prisma} client - Database
 * @param {string} sessionId - Game
 * @return {Promise<Set<string>>} - Words
 */

const playedWords = async (
  client: Prisma.TransactionClient | typeof prisma,
  sessionId: string
): Promise<Set<string>> => {
  const rows = await client.jumbleRound.findMany({ where: { sessionId }, select: { word: true } })

  return new Set(rows.map((row) => normalizeWord(row.word)))
}

/**
 * Seat the table, open the first round
 * @param {EngineSession} session - Game
 * @return {Promise<EngineStep>} - Step
 */

export const openTable = async (session: EngineSession): Promise<EngineStep> => {
  const settings = jumbleSettingsOf(session.settings)
  const { answer, display } = drawWord(1, settings.rounds, new Set(), settings.difficulty)
  const clock = clockOf(settings, countdownEnd(new Date(), JUMBLE_SETTINGS.countdownSeconds))
  const game = await prisma.jumbleGame.create({
    data: {
      sessionId: session.id,
      round: 1,
      answer,
      display,
      scrambled: scramble(answer),
      ...clock,
    },
  })

  return { changed: true, finished: false, deadline: deadlineOf(game, settings) }
}

/**
 * Final scores written on the seats
 * @param {JumbleTable} table - Locked table
 * @return {Promise<EngineStep>} - Finished step
 */

const closeTable = async ({ tx, session }: JumbleTable): Promise<EngineStep> => {
  const totals = await tx.jumbleRound.groupBy({
    by: ['solverId'],
    where: { sessionId: session.id, solverId: { not: null } },
    _sum: { points: true },
  })

  for (const accountId of session.players) {
    const score = totals.find((entry) => entry.solverId === accountId)?._sum.points ?? 0
    await tx.playSeat.update({
      where: { sessionId_accountId: { sessionId: session.id, accountId } },
      data: { score },
    })
  }

  return { changed: true, finished: true, deadline: null }
}

/**
 * Round over: its line is written, the answer stays on screen for a while
 * @param {JumbleTable} table - Locked table
 * @param {Prisma.JumbleRoundUncheckedCreateInput} line - Round line without game and round
 * @param {Prisma.JumbleGameUpdateInput} [data] - Extra table changes
 * @return {Promise<EngineStep>} - Step
 */

const endRound = async (
  { tx, session, settings, game, now }: JumbleTable,
  line: Pick<Prisma.JumbleRoundUncheckedCreateInput, 'solverId' | 'points' | 'ms' | 'streak'>,
  data: Prisma.JumbleGameUpdateInput = {}
): Promise<EngineStep> => {
  await tx.jumbleRound.create({
    data: { sessionId: session.id, round: game.round, word: game.display, ...line },
  })
  const updated = await tx.jumbleGame.update({
    where: { sessionId: session.id },
    data: { revealUntil: after(now, JUMBLE_SETTINGS.revealSeconds), ...data },
  })

  return { changed: true, finished: false, deadline: deadlineOf(updated, settings) }
}

/**
 * Next word on the table
 * @param {JumbleTable} table - Locked table
 * @return {Promise<EngineStep>} - Step
 */

const nextRound = async (table: JumbleTable): Promise<EngineStep> => {
  const { tx, session, settings, game, now } = table
  const round = game.round + 1
  const { answer, display } = drawWord(
    round,
    settings.rounds,
    await playedWords(tx, session.id),
    settings.difficulty
  )
  const next = await tx.jumbleGame.update({
    where: { sessionId: session.id },
    data: {
      round,
      answer,
      display,
      scrambled: scramble(answer),
      isHinted: false,
      solverId: null,
      solvedAt: null,
      revealUntil: null,
      ...clockOf(settings, now),
    },
  })

  return { changed: true, finished: false, deadline: deadlineOf(next, settings) }
}

/**
 * Play every overdue move of the table
 * @param {EngineSession} session - Game
 * @return {Promise<EngineStep>} - Step
 */

export const settleTable = (session: EngineSession): Promise<EngineStep> =>
  withTable(session, async (table) => {
    const { tx, game, settings, now } = table
    const deadline = deadlineOf(game, settings)
    if (now < deadline) return { ...IDLE_STEP, deadline }

    // Answer shown long enough
    if (game.revealUntil) {
      return game.round >= settings.rounds ? closeTable(table) : nextRound(table)
    }

    // Nobody found it
    if (now >= game.endsAt) return endRound(table, { solverId: null, points: 0, ms: 0, streak: 0 })

    const updated = await tx.jumbleGame.update({
      where: { sessionId: game.sessionId },
      data: { isHinted: true },
    })

    return { changed: true, finished: false, deadline: deadlineOf(updated, settings) }
  })

/**
 * Rounds won in a row by a player, this one included
 * @param {JumbleTable} table - Locked table
 * @param {string} accountId - Solver
 * @return {Promise<number>} - Streak
 */

const streakOf = async ({ tx, session, game }: JumbleTable, accountId: string): Promise<number> => {
  const before = await tx.jumbleRound.findUnique({
    where: { sessionId_round: { sessionId: session.id, round: game.round - 1 } },
    select: { solverId: true, streak: true },
  })

  return before?.solverId === accountId ? before.streak + 1 : 1
}

/**
 * Try a word on the round, the first right one takes it
 * @param {EngineSession} session - Game
 * @param {string} accountId - Player
 * @param {Record<string, unknown>} raw - Body with the word
 * @return {Promise<EngineStep>} - Step
 */

export const guessWord = (
  session: EngineSession,
  accountId: string,
  raw: Record<string, unknown>
): Promise<EngineStep> => {
  const typed = readBodyText(raw, 'word', PLAY_ERRORS.emptyWord).slice(
    0,
    JUMBLE_SETTINGS.wordLength
  )
  const guess = normalizeWord(typed)

  return withTable(session, async (table) => {
    const { game, settings, now } = table
    // Late guesses fall silently
    if (now < game.startsAt || game.revealUntil || now >= game.endsAt) return IDLE_STEP
    if (!isSolution(guess, game.answer, await frenchWords())) return IDLE_STEP

    // Speed and streak pay the round
    const ms = now.getTime() - game.startsAt.getTime()
    const streak = await streakOf(table, accountId)
    const { points } = pointsOf({
      elapsedMs: ms,
      totalMs: settings.roundSeconds * SECOND_MS,
      streak,
    })

    return endRound(
      table,
      { solverId: accountId, points, ms, streak },
      { solverId: accountId, solvedAt: now }
    )
  })
}
