import 'server-only'

import type { GlitchGame, Prisma } from '@prisma/client'

import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import { after, countdownEnd } from '@/core/lib/play/clock'
import {
  finishPoints,
  findPoints,
  glitchSettingsOf,
  markAt,
  roundScene,
} from '@/core/lib/play/glitch'
import type { GlitchGameSettings } from '@/core/lib/play/glitch'
import { IDLE_STEP } from '@/core/engines/play/steps'
import { holdSession } from '@/core/services/play/PlaySessionService'
import { GLITCH_SETTINGS, PLAY_ERRORS } from '@/declarations/play'
import type { EngineSession, EngineStep } from '@/types/play'
import { SECOND_MS } from '@/utils/constants/time'

// Locked table of a game
interface GlitchTable {
  tx: Prisma.TransactionClient
  session: EngineSession
  settings: GlitchGameSettings
  game: GlitchGame
  now: Date
}

/**
 * Next moment the table has to move
 * @param {GlitchGame} game - Table
 * @return {Date} - Deadline
 */

const deadlineOf = (game: GlitchGame): Date => game.revealUntil ?? game.endsAt

/**
 * Seed of a new round
 * @return {number} - Positive 31 bit integer
 */

const newSeed = (): number => Math.floor(Math.random() * 2 ** 31)

/**
 * Run work on the locked table
 * @param {EngineSession} session - Game
 * @param {(table: GlitchTable) => Promise<EngineStep>} work - Table work
 * @return {Promise<EngineStep>} - Step
 */

const withTable = (
  session: EngineSession,
  work: (table: GlitchTable) => Promise<EngineStep>
): Promise<EngineStep> =>
  prisma.$transaction(async (tx) => {
    await holdSession(tx, session.id)
    const game = await tx.glitchGame.findUnique({ where: { sessionId: session.id } })
    if (!game) throw notFound(PLAY_ERRORS.roundMissing)

    return work({
      tx,
      session,
      settings: glitchSettingsOf(session.settings),
      game,
      now: new Date(),
    })
  })

/**
 * Seat the table, open the first round
 * @param {EngineSession} session - Game
 * @return {Promise<EngineStep>} - Step
 */

export const openTable = async (session: EngineSession): Promise<EngineStep> => {
  const settings = glitchSettingsOf(session.settings)
  const startsAt = countdownEnd(new Date(), GLITCH_SETTINGS.countdownSeconds)
  const game = await prisma.glitchGame.create({
    data: {
      sessionId: session.id,
      round: 1,
      seed: newSeed(),
      startsAt,
      endsAt: after(startsAt, settings.roundSeconds),
    },
  })

  return { changed: true, finished: false, deadline: deadlineOf(game) }
}

/**
 * Final scores written on the seats
 * @param {GlitchTable} table - Locked table
 * @return {Promise<EngineStep>} - Finished step
 */

const closeTable = async ({ tx, session }: GlitchTable): Promise<EngineStep> => {
  const totals = await tx.glitchProgress.groupBy({
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
 * Round over: the missed differences stay on screen for a while
 * @param {GlitchTable} table - Locked table
 * @return {Promise<EngineStep>} - Step
 */

const endRound = async ({ tx, session, now }: GlitchTable): Promise<EngineStep> => {
  const updated = await tx.glitchGame.update({
    where: { sessionId: session.id },
    data: { revealUntil: after(now, GLITCH_SETTINGS.revealSeconds) },
  })

  return { changed: true, finished: false, deadline: deadlineOf(updated) }
}

/**
 * Next pair of pictures on the table
 * @param {GlitchTable} table - Locked table
 * @return {Promise<EngineStep>} - Step
 */

const nextRound = async ({
  tx,
  session,
  settings,
  game,
  now,
}: GlitchTable): Promise<EngineStep> => {
  const next = await tx.glitchGame.update({
    where: { sessionId: session.id },
    data: {
      round: game.round + 1,
      seed: newSeed(),
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
 * Coordinate of a click, kept inside the picture
 * @param {Record<string, unknown>} raw - Body
 * @param {string} field - Field name
 * @param {number} max - Size of the picture on that axis
 * @return {number | undefined} - Position, undefined when not a number
 */

const readSpot = (raw: Record<string, unknown>, field: string, max: number): number | undefined => {
  const value = raw[field]

  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(max, Math.max(0, value))
    : undefined
}

/**
 * Click on a picture: a difference is found, a miss freezes the picture for a moment
 * @param {EngineSession} session - Game
 * @param {string} accountId - Player
 * @param {Record<string, unknown>} raw - Body with the click position
 * @return {Promise<EngineStep>} - Step
 */

export const pickSpot = (
  session: EngineSession,
  accountId: string,
  raw: Record<string, unknown>
): Promise<EngineStep> => {
  const { width, height } = GLITCH_SETTINGS.scene
  const x = readSpot(raw, 'x', width)
  const y = readSpot(raw, 'y', height)

  return withTable(session, async (table) => {
    const { tx, game, settings, now } = table
    const isOpen = now >= game.startsAt && !game.revealUntil && now < game.endsAt
    // Late, foreign or lost clicks fall silently
    if (x === undefined || y === undefined || !isOpen || !session.players.includes(accountId)) {
      return IDLE_STEP
    }

    const where = {
      sessionId_round_accountId: { sessionId: session.id, round: game.round, accountId },
    }
    const mine = await tx.glitchProgress.findUnique({ where })
    if (mine?.rank || (mine?.lockUntil && mine.lockUntil > now)) return IDLE_STEP

    const scene = roundScene(game.seed, game.round, settings)
    const index = markAt(scene.marks, x, y)
    const found = mine?.found ?? []
    if (found.includes(index)) return IDLE_STEP
    const key = { sessionId: session.id, round: game.round, accountId }

    // A miss freezes the picture
    if (index < 0) {
      const lockUntil = after(now, GLITCH_SETTINGS.lockMs / SECOND_MS)
      await tx.glitchProgress.upsert({
        where,
        create: { ...key, found: [], misses: 1, lockUntil },
        update: { misses: { increment: 1 }, lockUntil },
      })

      return { changed: true, finished: false, deadline: deadlineOf(game) }
    }

    const all = [...found, index]
    const ms = now.getTime() - game.startsAt.getTime()
    let points = (mine?.points ?? 0) + findPoints()
    let rank: number | null = null
    let isEveryoneDone = false

    // The last difference closes the picture
    if (all.length === scene.marks.length) {
      const done = await tx.glitchProgress.findMany({
        where: { sessionId: session.id, round: game.round, rank: { not: null } },
        select: { accountId: true },
      })
      rank = done.length + 1
      points += finishPoints({ elapsedMs: ms, totalMs: settings.roundSeconds * SECOND_MS, rank })
      isEveryoneDone = session.players.every(
        (id) => id === accountId || done.some((entry) => entry.accountId === id)
      )
    }

    await tx.glitchProgress.upsert({
      where,
      create: { ...key, found: all, rank, points, ms },
      update: { found: all, rank, points, ms },
    })

    if (isEveryoneDone) return endRound(table)

    return { changed: true, finished: false, deadline: deadlineOf(game) }
  })
}
