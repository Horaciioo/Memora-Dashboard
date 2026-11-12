import 'server-only'

import type { CroquisGame, Prisma } from '@prisma/client'

import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import { readBodyInteger, readBodyText } from '@/core/lib/play'
import { after, countdownEnd } from '@/core/lib/play/clock'
import {
  comparable,
  croquisSettingsOf,
  drawWord,
  drawerPointsOf,
  isMatch,
  pointsOf,
  putStroke,
  readStroke,
  shuffle,
} from '@/core/lib/play/croquis'
import type { CroquisGameSettings, CroquisStroke } from '@/core/lib/play/croquis'
import { IDLE_STEP } from '@/core/engines/play/steps'
import { holdSession } from '@/core/services/play/PlaySessionService'
import { CROQUIS_SETTINGS, PLAY_ERRORS } from '@/declarations/play'
import type { EngineSession, EngineStep } from '@/types/play'
import { SECOND_MS } from '@/utils/constants/time'

// Locked table of a game
interface CroquisTable {
  tx: Prisma.TransactionClient
  session: EngineSession
  settings: CroquisGameSettings
  game: CroquisGame
  now: Date
}

/**
 * Clock of a round opening at a moment
 * @param {CroquisGameSettings} settings - Game settings
 * @param {Date} startsAt - Opening
 * @return {{ startsAt: Date, endsAt: Date, hintAt: Date }} - Round clock
 */

const clockOf = (settings: CroquisGameSettings, startsAt: Date) => ({
  startsAt,
  endsAt: after(startsAt, settings.roundSeconds),
  hintAt: after(startsAt, settings.roundSeconds * CROQUIS_SETTINGS.hintRatio),
})

/**
 * Next moment the table has to move
 * @param {CroquisGame} game - Table
 * @param {CroquisGameSettings} settings - Game settings
 * @return {Date} - Deadline
 */

const deadlineOf = (game: CroquisGame, settings: CroquisGameSettings): Date => {
  if (game.revealUntil) return game.revealUntil

  return settings.hasHint && !game.isHinted ? game.hintAt : game.endsAt
}

/**
 * Run work on the locked table
 * @param {EngineSession} session - Game
 * @param {(table: CroquisTable) => Promise<EngineStep>} work - Table work
 * @return {Promise<EngineStep>} - Step
 */

const withTable = (
  session: EngineSession,
  work: (table: CroquisTable) => Promise<EngineStep>
): Promise<EngineStep> =>
  prisma.$transaction(async (tx) => {
    await holdSession(tx, session.id)
    const game = await tx.croquisGame.findUnique({ where: { sessionId: session.id } })
    if (!game) throw notFound(PLAY_ERRORS.roundMissing)

    return work({
      tx,
      session,
      settings: croquisSettingsOf(session.settings),
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
  const rows = await client.croquisRound.findMany({ where: { sessionId }, select: { word: true } })

  return new Set(rows.map((row) => comparable(row.word)))
}

/**
 * Drawer of a round: the next of the order still seated
 * @param {string[]} order - Drawers in turn
 * @param {number} round - Round, from one
 * @param {string[]} seated - Players still at the table
 * @return {string} - Drawer
 */

const drawerOf = (order: string[], round: number, seated: string[]): string => {
  for (let step = 0; step < order.length; step += 1) {
    const candidate = order[(round - 1 + step) % order.length]
    if (seated.includes(candidate)) return candidate
  }

  return seated[0] ?? order[0]
}

/**
 * Seat the table, open the first round
 * @param {EngineSession} session - Game
 * @return {Promise<EngineStep>} - Step
 */

export const openTable = async (session: EngineSession): Promise<EngineStep> => {
  const settings = croquisSettingsOf(session.settings)
  // Bots guess but never draw
  const bots = await prisma.account.findMany({
    where: { id: { in: session.players }, botKind: { not: null } },
    select: { id: true },
  })
  const botIds = new Set(bots.map((bot) => bot.id))
  const humans = session.players.filter((id) => !botIds.has(id))
  const order = shuffle(humans.length ? humans : session.players)
  const { word, display } = drawWord(settings.difficulty, new Set())
  const game = await prisma.croquisGame.create({
    data: {
      sessionId: session.id,
      round: 1,
      rounds: order.length * settings.laps,
      order,
      drawerId: order[0],
      word,
      display,
      ...clockOf(settings, countdownEnd(new Date(), CROQUIS_SETTINGS.countdownSeconds)),
    },
  })

  return { changed: true, finished: false, deadline: deadlineOf(game, settings) }
}

/**
 * Final scores written on the seats
 * @param {CroquisTable} table - Locked table
 * @return {Promise<EngineStep>} - Finished step
 */

const closeTable = async ({ tx, session }: CroquisTable): Promise<EngineStep> => {
  const where = { sessionId: session.id }
  const [guesses, drawn] = await Promise.all([
    tx.croquisGuess.groupBy({ by: ['accountId'], where, _sum: { points: true } }),
    tx.croquisRound.groupBy({ by: ['drawerId'], where, _sum: { points: true } }),
  ])

  for (const accountId of session.players) {
    const score =
      (guesses.find((entry) => entry.accountId === accountId)?._sum.points ?? 0) +
      (drawn.find((entry) => entry.drawerId === accountId)?._sum.points ?? 0)
    await tx.playSeat.update({
      where: { sessionId_accountId: { sessionId: session.id, accountId } },
      data: { score },
    })
  }

  return { changed: true, finished: true, deadline: null }
}

/**
 * Round over: its line is written, the word stays on screen for a while
 * @param {CroquisTable} table - Locked table
 * @return {Promise<EngineStep>} - Step
 */

const endRound = async ({
  tx,
  session,
  settings,
  game,
  now,
}: CroquisTable): Promise<EngineStep> => {
  const solvers = await tx.croquisGuess.count({
    where: { sessionId: session.id, round: game.round },
  })
  const guessers = session.players.filter((id) => id !== game.drawerId).length
  await tx.croquisRound.create({
    data: {
      sessionId: session.id,
      round: game.round,
      drawerId: game.drawerId,
      word: game.display,
      solvers,
      points: drawerPointsOf(solvers, guessers),
    },
  })
  const updated = await tx.croquisGame.update({
    where: { sessionId: session.id },
    data: { revealUntil: after(now, CROQUIS_SETTINGS.revealSeconds) },
  })

  return { changed: true, finished: false, deadline: deadlineOf(updated, settings) }
}

/**
 * Next drawer and next word on the table
 * @param {CroquisTable} table - Locked table
 * @return {Promise<EngineStep>} - Step
 */

const nextRound = async (table: CroquisTable): Promise<EngineStep> => {
  const { tx, session, settings, game, now } = table
  const round = game.round + 1
  const { word, display } = drawWord(settings.difficulty, await playedWords(tx, session.id))
  const next = await tx.croquisGame.update({
    where: { sessionId: session.id },
    data: {
      round,
      drawerId: drawerOf(game.order as string[], round, session.players),
      word,
      display,
      strokes: [],
      isHinted: false,
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

    // Word shown long enough
    if (game.revealUntil) {
      return game.round >= game.rounds ? closeTable(table) : nextRound(table)
    }

    // Time is up
    if (now >= game.endsAt) return endRound(table)

    const updated = await tx.croquisGame.update({
      where: { sessionId: game.sessionId },
      data: { isHinted: true },
    })

    return { changed: true, finished: false, deadline: deadlineOf(updated, settings) }
  })

// Round open to guesses and strokes
const isOpen = ({ game, now }: Pick<CroquisTable, 'game' | 'now'>): boolean =>
  now >= game.startsAt && !game.revealUntil && now < game.endsAt

/**
 * Try a word on the round, every right one scores
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
    CROQUIS_SETTINGS.wordLength
  )

  return withTable(session, async (table) => {
    const { tx, game, settings, now } = table
    // Late guesses, the drawer's and wrong words fall silently
    if (!isOpen(table) || accountId === game.drawerId || !isMatch(typed, game.word)) {
      return IDLE_STEP
    }
    const done = await tx.croquisGuess.findMany({
      where: { sessionId: session.id, round: game.round },
      select: { accountId: true },
    })
    if (done.some((entry) => entry.accountId === accountId)) return IDLE_STEP

    const rank = done.length + 1
    const ms = now.getTime() - game.startsAt.getTime()
    const points = pointsOf({ elapsedMs: ms, totalMs: settings.roundSeconds * SECOND_MS, rank })
    await tx.croquisGuess.create({
      data: { sessionId: session.id, round: game.round, accountId, rank, points, ms },
    })

    // Everyone else found it
    const guessers = session.players.filter((id) => id !== game.drawerId)
    if (rank >= guessers.length) return endRound(table)

    return { changed: true, finished: false, deadline: deadlineOf(game, settings) }
  })
}

/**
 * Drawing changes of the drawer: a stroke put, the last one undone or all wiped
 * @param {EngineSession} session - Game
 * @param {string} accountId - Player
 * @param {Record<string, unknown>} raw - Body with the change
 * @return {Promise<EngineStep>} - Step
 */

export const drawStroke = (
  session: EngineSession,
  accountId: string,
  raw: Record<string, unknown>
): Promise<EngineStep> =>
  withTable(session, async (table) => {
    const { tx, game, settings } = table
    if (!isOpen(table) || accountId !== game.drawerId) return IDLE_STEP

    const strokes = game.strokes as unknown as CroquisStroke[]
    const stroke = raw.type === 'stroke' ? readStroke(raw.stroke) : null
    const index = readBodyInteger(raw, 'index')
    const next =
      raw.type === 'clear'
        ? []
        : raw.type === 'undo'
          ? strokes.slice(0, -1)
          : stroke && index !== undefined
            ? putStroke(strokes, index, stroke)
            : null
    if (!next) return IDLE_STEP

    await tx.croquisGame.update({
      where: { sessionId: session.id },
      data: { strokes: next as unknown as Prisma.InputJsonArray },
    })

    return { changed: true, finished: false, deadline: deadlineOf(game, settings) }
  })
