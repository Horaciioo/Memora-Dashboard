import 'server-only'

import { prisma } from '@/core/lib/db'
import { logger } from '@/core/lib/logger'
import { signalPlay } from '@/core/lib/play/signal'
import { clearSessionTimers, scheduleDeadline, timerKey } from '@/core/lib/play/timers'
import { PLAY_SETTINGS } from '@/declarations/play'
import { PlayStatuses } from '@/utils/constants/play'
import { MINUTE_MS } from '@/utils/constants/time'

// Survives dev hot reloads
const globalForIdle = globalThis as unknown as {
  playActions?: Map<string, number>
  playSweptAt?: number
}

// Last action per running game
const lastActions = (globalForIdle.playActions ??= new Map())

// Database touch and sweep spacing
const TOUCH_MS = MINUTE_MS

/**
 * Stop a running game, no XP paid
 * @param {string} sessionId - Game
 * @return {Promise<void>} - Stopped
 */

export const abandonRunning = async (sessionId: string): Promise<void> => {
  clearSessionTimers(sessionId)
  lastActions.delete(sessionId)

  // Only a running game stops
  const { count } = await prisma.playSession.updateMany({
    where: { id: sessionId, status: PlayStatuses.Running },
    data: { status: PlayStatuses.Abandoned },
  })
  if (!count) return

  // Tournament stops with it
  const session = await prisma.playSession.findUnique({
    where: { id: sessionId },
    select: { tournamentId: true },
  })
  if (session?.tournamentId) {
    await prisma.playTournament.update({
      where: { id: session.tournamentId },
      data: { status: PlayStatuses.Abandoned },
    })
  }
  await signalPlay(sessionId, true)
}

/**
 * Wake once at the idle limit, or later after a recent action
 * @param {string} sessionId - Game
 * @param {number} at - Due time
 * @return {void}
 */

const armIdle = (sessionId: string, at: number): void =>
  scheduleDeadline(timerKey('idle', sessionId), new Date(at), async () => {
    const due = (lastActions.get(sessionId) ?? 0) + PLAY_SETTINGS.idle.gameMinutes * MINUTE_MS
    if (due > Date.now()) return armIdle(sessionId, due)

    await abandonRunning(sessionId)
  })

/**
 * Record a player action, restarting the idle clock
 * @param {string} sessionId - Game
 * @return {void}
 */

export const noteAction = (sessionId: string): void => {
  const now = Date.now()
  const previous = lastActions.get(sessionId)
  lastActions.set(sessionId, now)

  // One timer per game, re-armed only when it fires
  if (previous === undefined) armIdle(sessionId, now + PLAY_SETTINGS.idle.gameMinutes * MINUTE_MS)
  // Persist at most once a minute, a restart still sees it
  if (previous === undefined || now - previous >= TOUCH_MS) {
    void prisma.playSession
      .update({ where: { id: sessionId }, data: { updatedAt: new Date() } })
      .catch((error: unknown) => logger.warn('[play] touch failed', error))
  }
}

/**
 * Stop running games silent past the limit, whatever the process memory
 * @return {Promise<void>} - Swept
 */

export const sweepIdleGames = async (): Promise<void> => {
  const now = Date.now()
  if (now - (globalForIdle.playSweptAt ?? 0) < TOUCH_MS) return
  globalForIdle.playSweptAt = now

  const stale = await prisma.playSession.findMany({
    where: {
      status: PlayStatuses.Running,
      updatedAt: { lt: new Date(now - PLAY_SETTINGS.idle.gameMinutes * MINUTE_MS) },
    },
    select: { id: true },
  })
  for (const { id } of stale) await abandonRunning(id)
}
