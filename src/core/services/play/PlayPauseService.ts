import 'server-only'

import { prisma } from '@/core/lib/db'
import { conflict } from '@/core/lib/errors'
import { signalPlay } from '@/core/lib/play/signal'
import { clearSessionTimers } from '@/core/lib/play/timers'
import { forgetBots } from '@/core/engines/play/players/BotDriver'
import { settleSession, wakeBots } from '@/core/services/play/GameService'
import { forgetIdle } from '@/core/services/play/PlayIdleService'
import { lockSession } from '@/core/services/play/PlaySessionService'
import { PLAY_ERRORS } from '@/declarations/play'
import { PlayStatuses } from '@/utils/constants/play'
import type { PlayGameName } from '@/utils/constants/play'
import type { Prisma } from '@prisma/client'

// Date columns a pause pushes back, per game
const SHIFTERS: Record<
  PlayGameName,
  (tx: Prisma.TransactionClient, id: string, seconds: number) => Promise<unknown>
> = {
  BACCALAUREAT: (tx, id, s) => tx.$executeRaw`
    UPDATE play_baccalaureat_rounds
    SET "startsAt" = "startsAt" + (${s}::float8 * interval '1 second'),
        "endsAt" = "endsAt" + (${s}::float8 * interval '1 second'),
        "reviewEndsAt" = "reviewEndsAt" + (${s}::float8 * interval '1 second')
    WHERE "sessionId" = ${id} AND "scoredAt" IS NULL`,
  BOMB: (tx, id, s) => tx.$executeRaw`
    UPDATE play_bomb_games
    SET "startsAt" = "startsAt" + (${s}::float8 * interval '1 second'),
        "explodesAt" = "explodesAt" + (${s}::float8 * interval '1 second'),
        "blastAt" = "blastAt" + (${s}::float8 * interval '1 second')
    WHERE "sessionId" = ${id}`,
  GOLF: async (tx, id, s) => {
    await tx.$executeRaw`
      UPDATE play_golf_games
      SET "startsAt" = "startsAt" + (${s}::float8 * interval '1 second'),
          "endsAt" = "endsAt" + (${s}::float8 * interval '1 second')
      WHERE "sessionId" = ${id}`
    await tx.$executeRaw`
      UPDATE play_golf_players
      SET "restsAt" = "restsAt" + (${s}::float8 * interval '1 second')
      WHERE "sessionId" = ${id}`
  },
  ECHO: (tx, id, s) => tx.$executeRaw`
    UPDATE play_echo_games
    SET "startsAt" = "startsAt" + (${s}::float8 * interval '1 second'),
        "endsAt" = "endsAt" + (${s}::float8 * interval '1 second'),
        "revealUntil" = "revealUntil" + (${s}::float8 * interval '1 second')
    WHERE "sessionId" = ${id}`,
  GLITCH: (tx, id, s) => tx.$executeRaw`
    UPDATE play_glitch_games
    SET "startsAt" = "startsAt" + (${s}::float8 * interval '1 second'),
        "endsAt" = "endsAt" + (${s}::float8 * interval '1 second'),
        "revealUntil" = "revealUntil" + (${s}::float8 * interval '1 second')
    WHERE "sessionId" = ${id}`,
  JUMBLE: (tx, id, s) => tx.$executeRaw`
    UPDATE play_jumble_games
    SET "startsAt" = "startsAt" + (${s}::float8 * interval '1 second'),
        "endsAt" = "endsAt" + (${s}::float8 * interval '1 second'),
        "hintAt" = "hintAt" + (${s}::float8 * interval '1 second'),
        "revealUntil" = "revealUntil" + (${s}::float8 * interval '1 second')
    WHERE "sessionId" = ${id}`,
  LUDO: (tx, id, s) => tx.$executeRaw`
    UPDATE play_ludo_games
    SET "startsAt" = "startsAt" + (${s}::float8 * interval '1 second'),
        "turnEndsAt" = "turnEndsAt" + (${s}::float8 * interval '1 second')
    WHERE "sessionId" = ${id}`,
  NAVAL: async (tx, id, s) => {
    await tx.$executeRaw`
      UPDATE play_naval_games
      SET "startsAt" = "startsAt" + (${s}::float8 * interval '1 second'),
          "phaseEndsAt" = "phaseEndsAt" + (${s}::float8 * interval '1 second')
      WHERE "sessionId" = ${id}`
    await tx.$executeRaw`
      UPDATE play_naval_matches
      SET "startsAt" = "startsAt" + (${s}::float8 * interval '1 second'),
          "turnEndsAt" = "turnEndsAt" + (${s}::float8 * interval '1 second')
      WHERE "sessionId" = ${id}`
  },
}

/**
 * Hold a running game
 * @param {string} sessionId - Game
 * @param {string} actorId - Who pauses
 * @param {string | null} reason - Words kept
 * @return {Promise<void>} - Paused
 */

export const pauseSession = async (
  sessionId: string,
  actorId: string,
  reason: string | null
): Promise<void> => {
  await prisma.$transaction(async (tx) => {
    const session = await lockSession(tx, sessionId)
    if (session.status !== PlayStatuses.Running) throw conflict(PLAY_ERRORS.notRunning)

    await tx.playSession.update({
      where: { id: sessionId },
      data: {
        status: PlayStatuses.Paused,
        pausedAt: new Date(),
        pausedById: actorId,
        pauseReason: reason,
      },
    })
  })

  // Deadlines and bots stop with the clock, plans and idle clock drawn again on resume
  clearSessionTimers(sessionId)
  forgetBots(sessionId)
  forgetIdle(sessionId)
  await signalPlay(sessionId, true)
}

/**
 * Release a paused game, deadlines pushed back by the pause
 * @param {string} sessionId - Game
 * @return {Promise<number>} - Seconds shifted
 */

export const resumeSession = async (sessionId: string): Promise<number> => {
  const { seconds, game } = await prisma.$transaction(async (tx) => {
    const session = await lockSession(tx, sessionId)
    if (session.status !== PlayStatuses.Paused || !session.pausedAt) {
      throw conflict(PLAY_ERRORS.notRunning)
    }

    const held = (Date.now() - session.pausedAt.getTime()) / 1000
    await SHIFTERS[session.game](tx, sessionId, held)
    await tx.playSession.update({
      where: { id: sessionId },
      data: {
        status: PlayStatuses.Running,
        pausedAt: null,
        pausedById: null,
        pauseReason: null,
      },
    })

    return { seconds: held, game: session.game }
  })

  // Timers come back from the shifted dates
  await settleSession(sessionId)
  wakeBots(sessionId, game)
  await signalPlay(sessionId, true)

  return seconds
}
