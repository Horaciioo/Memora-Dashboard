import 'server-only'

import { signalPlay } from '@/core/lib/play/signal'

// Survives dev hot reloads
const globalForWatchers = globalThis as unknown as {
  playWatchers?: Map<string, Map<string, number>>
}

const watchers = (globalForWatchers.playWatchers ??= new Map())

/**
 * Count one open stream of a reader on a game
 * @param {string} sessionId - Game
 * @param {string} accountId - Reader
 * @param {AbortSignal} signal - Stream end
 * @return {void}
 */

export const watchSession = (sessionId: string, accountId: string, signal: AbortSignal): void => {
  const readers = watchers.get(sessionId) ?? new Map<string, number>()
  watchers.set(sessionId, readers)
  const opened = readers.get(accountId) ?? 0
  readers.set(accountId, opened + 1)
  if (!opened) void signalPlay(sessionId)

  // Last tab gone, the stands move
  const release = () => {
    const left = (readers.get(accountId) ?? 1) - 1
    if (left > 0) return void readers.set(accountId, left)
    readers.delete(accountId)
    if (!readers.size) watchers.delete(sessionId)
    void signalPlay(sessionId)
  }
  if (signal.aborted) release()
  else signal.addEventListener('abort', release, { once: true })
}

/**
 * Readers following a game right now
 * @param {string} sessionId - Game
 * @return {string[]} - Accounts
 */

export const watchersOf = (sessionId: string): string[] => [
  ...(watchers.get(sessionId)?.keys() ?? []),
]
