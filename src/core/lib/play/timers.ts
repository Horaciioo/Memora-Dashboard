import 'server-only'

import { logger } from '@/core/lib/logger'

// Survives dev hot reloads
const globalForTimers = globalThis as unknown as {
  playTimers?: Map<string, ReturnType<typeof setTimeout>>
  playSettled?: Map<string, number>
}

const timers = (globalForTimers.playTimers ??= new Map())

// Next timed move per game, nothing due before it
const settled = (globalForTimers.playSettled ??= new Map())

/**
 * Remember when a game next has something due
 * @param {string} sessionId - Game
 * @param {Date | null} until - Next deadline, null when unknown
 * @return {void}
 */

export const markSettled = (sessionId: string, until: Date | null): void => {
  if (until) settled.set(sessionId, until.getTime())
  else settled.delete(sessionId)
}

/**
 * Game with nothing overdue, a settle would change nothing
 * @param {string} sessionId - Game
 * @return {boolean} - Up to date
 */

export const isSettled = (sessionId: string): boolean =>
  (settled.get(sessionId) ?? 0) > Date.now()

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

/**
 * Session timer key, one per kind
 * @param {'idle' | 'away'} kind - Timer kind
 * @param {string} sessionId - Game
 * @return {string} - Key
 */

export const timerKey = (kind: 'idle' | 'away' | 'bot', sessionId: string): string =>
  `${kind}:${sessionId}`

/**
 * Bot move timer key
 * @param {string} sessionId - Game
 * @param {string} botId - Bot
 * @return {string} - Key
 */

export const botTimerKey = (sessionId: string, botId: string): string =>
  `${timerKey('bot', sessionId)}:${botId}`

/**
 * Drop every pending timer of a game
 * @param {string} sessionId - Game
 * @return {void}
 */

export const clearSessionTimers = (sessionId: string): void => {
  clearDeadline(sessionId)
  settled.delete(sessionId)
  clearDeadline(timerKey('idle', sessionId))
  clearDeadline(timerKey('away', sessionId))
  // Every bot of the table
  const bots = `${timerKey('bot', sessionId)}:`
  for (const key of [...timers.keys()]) if (key.startsWith(bots)) clearDeadline(key)
}
