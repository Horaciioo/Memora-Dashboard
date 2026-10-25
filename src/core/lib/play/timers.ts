import 'server-only'

import { logger } from '@/core/lib/logger'

// Survives dev hot reloads
const globalForTimers = globalThis as unknown as {
  playTimers?: Map<string, ReturnType<typeof setTimeout>>
}

const timers = (globalForTimers.playTimers ??= new Map())

/**
 * Run a game's next deadline, replacing the previous one
 * @param {string} sessionId - Game
 * @param {Date} at - Deadline
 * @param {() => Promise<unknown>} task - Deadline work
 * @return {void}
 */

export const scheduleDeadline = (
  sessionId: string,
  at: Date,
  task: () => Promise<unknown>
): void => {
  clearDeadline(sessionId)

  // Settling is idempotent, an extra run is harmless
  const timer = setTimeout(
    () => {
      timers.delete(sessionId)
      void task().catch((error: unknown) => logger.warn('[play] deadline failed', error))
    },
    Math.max(0, at.getTime() - Date.now())
  )
  timers.set(sessionId, timer)
}

/**
 * Drop a game's pending deadline
 * @param {string} sessionId - Game
 * @return {void}
 */

export const clearDeadline = (sessionId: string): void => {
  const timer = timers.get(sessionId)
  if (timer) clearTimeout(timer)
  timers.delete(sessionId)
}
