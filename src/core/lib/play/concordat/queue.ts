import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatIntent } from '@/types/concordat'

const { sim } = CONCORDAT

// Rolling one second window
const WINDOW_MS = 1000

/**
 * Commands waiting for the next tick
 * @typedef {Object} ConcordatQueue
 */

export interface ConcordatQueue {
  pending: ConcordatIntent[]
  waiting: Map<number, number>
  windows: Map<number, { startedAt: number; count: number }>
}

/**
 * Empty queue
 * @return {ConcordatQueue} - Queue
 */

export const createQueue = (): ConcordatQueue => ({
  pending: [],
  waiting: new Map(),
  windows: new Map(),
})

/**
 * Queue a command, a flood is refused
 * @param {ConcordatQueue} queue - Queue
 * @param {ConcordatIntent} intent - Command
 * @param {number} now - Clock in ms
 * @return {'rate' | 'full' | null} - Refusal
 */

export const offerIntent = (
  queue: ConcordatQueue,
  intent: ConcordatIntent,
  now: number
): 'rate' | 'full' | null => {
  const window = queue.windows.get(intent.playerId)
  if (!window || now - window.startedAt >= WINDOW_MS) {
    queue.windows.set(intent.playerId, { startedAt: now, count: 1 })
  } else if (window.count >= sim.intentsPerSecond) {
    return 'rate'
  } else {
    window.count++
  }

  const waiting = queue.waiting.get(intent.playerId) ?? 0
  if (waiting >= sim.intentQueue) return 'full'
  queue.waiting.set(intent.playerId, waiting + 1)
  queue.pending.push(intent)

  return null
}

/**
 * Take every queued command, in arrival order
 * @param {ConcordatQueue} queue - Queue
 * @return {ConcordatIntent[]} - Commands
 */

export const takeIntents = (queue: ConcordatQueue): ConcordatIntent[] => {
  queue.waiting.clear()

  return queue.pending.splice(0, queue.pending.length)
}
