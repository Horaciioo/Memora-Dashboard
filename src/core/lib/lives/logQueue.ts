import 'server-only'

import { logger } from '@/core/lib/logger'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'

// One deferred write
type LogTask = () => Promise<unknown>

// Survives dev hot reloads
const globalForLogQueue = globalThis as unknown as {
  liveLogQueue?: { waiting: LogTask[]; running: number; isFull: boolean }
}

const queue = (globalForLogQueue.liveLogQueue ??= { waiting: [], running: 0, isFull: false })

// Run within the cap
const drain = (): void => {
  while (queue.running < LIVE_SETTINGS.logConcurrency) {
    const task = queue.waiting.shift()
    if (!task) return

    queue.running += 1
    void task()
      .catch(() => null)
      .finally(() => {
        queue.running -= 1
        drain()
      })
  }
}

/**
 * Queue one log write
 * @param {LogTask} task - Write
 * @return {void}
 */

export const queueLogWrite = (task: LogTask): void => {
  // A flood never starves the pool
  if (queue.waiting.length >= LIVE_SETTINGS.logQueueMax) {
    if (!queue.isFull) logger.warn('[lives] log queue full, writes dropped')
    queue.isFull = true
    return
  }

  queue.isFull = false
  queue.waiting.push(task)
  drain()
}
