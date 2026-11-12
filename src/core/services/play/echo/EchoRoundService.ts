import 'server-only'

import type { EchoGame, Prisma } from '@prisma/client'

import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import { readBodyInteger } from '@/core/lib/play'
import { after, countdownEnd } from '@/core/lib/play/clock'
import { answerOf, dealRound, echoSettingsOf, pointsOf } from '@/core/lib/play/echo'
import type { EchoDeal, EchoGameSettings } from '@/core/lib/play/echo'
import { IDLE_STEP } from '@/core/engines/play/steps'
import { holdSession } from '@/core/services/play/PlaySessionService'
import { ECHO_SETTINGS, PLAY_ERRORS } from '@/declarations/play'
import type { EngineSession, EngineStep } from '@/types/play'
import { SECOND_MS } from '@/utils/constants/time'

// Locked table of a game
interface EchoTable {
  tx: Prisma.TransactionClient
  session: EngineSession
  settings: EchoGameSettings
  game: EchoGame
  now: Date
}

// Moment each locked player may try again
type Locks = Record<string, string>

/**
 * Next moment the table has to move
 * @param {EchoGame} game - Table
 * @return {Date} - Deadline
 */

const deadlineOf = (game: EchoGame): Date => game.revealUntil ?? game.endsAt

/**
 * Run work on the locked table
 * @param {EngineSession} session - Game
 * @param {(table: EchoTable) => Promise<EngineStep>} work - Table work
 * @return {Promise<EngineStep>} - Step
 */

const withTable = (
  session: EngineSession,
  work: (table: EchoTable) => Promise<EngineStep>
): Promise<EngineStep> =>
  prisma.$transaction(async (tx) => {
    await holdSession(tx, session.id)
    const game = await tx.echoGame.findUnique({ where: { sessionId: session.id } })
    if (!game) throw notFound(PLAY_ERRORS.roundMissing)

    return work({ tx, session, settings: echoSettingsOf(session.settings), game, now: new Date() })
  })

/**
 * Seat the table, open the first round
 * @param {EngineSession} session - Game
 * @return {Promise<EngineStep>} - Step
 */

export const openTable = async (session: EngineSession): Promise<EngineStep> => {
  const settings = echoSettingsOf(session.settings)
  const startsAt = countdownEnd(new Date(), ECHO_SETTINGS.countdownSeconds)
  const game = await prisma.echoGame.create({
    data: {
      sessionId: session.id,
      round: 1,
      deal: dealRound(session.players) as unknown as Prisma.InputJsonObject,
      startsAt,
      endsAt: after(startsAt, settings.roundSeconds),
    },
  })

  return { changed: true, finished: false, deadline: deadlineOf(game) }
}

/**
 * Final scores written on the seats
 * @param {EchoTable} table - Locked table
 * @return {Promise<EngineStep>} - Finished step
 */

const closeTable = async ({ tx, session }: EchoTable): Promise<EngineStep> => {
  const totals = await tx.echoFind.groupBy({
    by: ['accountId'],
    where: { sessionId: session.id },
    _sum: { points: true },
  })

  for (const accountId of session.players) {
    const score = totals.find((entry) => entry.accountId === accountId)?._sum.points ?? 0
    await tx.playSeat.update({
      where: { sessionId_accountId: { sessionId: session.id, accountId } },
      data: { score },
    })
  }

  return { changed: true, finished: true, deadline: null }
}

/**
 * Round over: the answers stay on screen for a while
 * @param {EchoTable} table - Locked table
 * @return {Promise<EngineStep>} - Step
 */

const endRound = async ({ tx, session, now }: EchoTable): Promise<EngineStep> => {
  const updated = await tx.echoGame.update({
    where: { sessionId: session.id },
    data: { revealUntil: after(now, ECHO_SETTINGS.revealSeconds) },
  })

  return { changed: true, finished: false, deadline: deadlineOf(updated) }
}

/**
 * Next deal on the table
 * @param {EchoTable} table - Locked table
 * @return {Promise<EngineStep>} - Step
 */

const nextRound = async ({ tx, session, settings, game, now }: EchoTable): Promise<EngineStep> => {
  const next = await tx.echoGame.update({
    where: { sessionId: session.id },
    data: {
      round: game.round + 1,
      deal: dealRound(session.players) as unknown as Prisma.InputJsonObject,
      locks: {},
      revealUntil: null,
      startsAt: now,
      endsAt: after(now, settings.roundSeconds),
    },
  })

  return { changed: true, finished: false, deadline: deadlineOf(next) }
}

/**
 * Play every overdue move of the table
 * @param {EngineSession} session - Game
 * @return {Promise<EngineStep>} - Step
 */

export const settleTable = (session: EngineSession): Promise<EngineStep> =>
  withTable(session, async (table) => {
    const { game, settings, now } = table
    const deadline = deadlineOf(game)
    if (now < deadline) return { ...IDLE_STEP, deadline }

    if (!game.revealUntil) return endRound(table)

    return game.round >= settings.rounds ? closeTable(table) : nextRound(table)
  })

/**
 * Try a symbol on the own card, the right one scores
 * @param {EngineSession} session - Game
 * @param {string} accountId - Player
 * @param {Record<string, unknown>} raw - Body with the symbol id
 * @return {Promise<EngineStep>} - Step
 */

export const pickSymbol = (
  session: EngineSession,
  accountId: string,
  raw: Record<string, unknown>
): Promise<EngineStep> => {
  const symbol = readBodyInteger(raw, 'symbol')

  return withTable(session, async (table) => {
    const { tx, game, settings, now } = table
    const deal = game.deal as unknown as EchoDeal
    const locks = game.locks as Locks
    const isOpen = now >= game.startsAt && !game.revealUntil && now < game.endsAt
    const isLocked = new Date(locks[accountId] ?? 0) > now
    // Late, locked or foreign picks fall silently
    if (symbol === undefined || !isOpen || isLocked || deal.hands[accountId] === undefined) {
      return IDLE_STEP
    }
    const done = await tx.echoFind.findMany({
      where: { sessionId: session.id, round: game.round },
      select: { accountId: true },
    })
    if (done.some((find) => find.accountId === accountId)) return IDLE_STEP

    // Wrong symbol locks the card for a moment
    if (symbol !== answerOf(deal, accountId)) {
      const locked = await tx.echoGame.update({
        where: { sessionId: session.id },
        data: {
          locks: {
            ...locks,
            [accountId]: after(now, ECHO_SETTINGS.lockMs / SECOND_MS).toISOString(),
          },
        },
      })

      return { changed: true, finished: false, deadline: deadlineOf(locked) }
    }

    const rank = done.length + 1
    const ms = now.getTime() - game.startsAt.getTime()
    const points = pointsOf({ elapsedMs: ms, totalMs: settings.roundSeconds * SECOND_MS, rank })
    await tx.echoFind.create({
      data: { sessionId: session.id, round: game.round, accountId, rank, points, ms, symbol },
    })

    // Everyone seated found theirs
    const seated = session.players.filter((id) => deal.hands[id] !== undefined)
    if (rank >= seated.length) return endRound(table)

    return { changed: true, finished: false, deadline: deadlineOf(game) }
  })
}
