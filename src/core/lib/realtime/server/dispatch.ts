import 'server-only'

import { notFound, toAppError } from '@/core/lib/errors'
import { logger } from '@/core/lib/logger'
import type {
  RealtimeConnection,
  RealtimeRequest,
  RealtimeTopic,
} from '@/core/lib/realtime/server/types'
import { REALTIME_KINDS, REALTIME_SETTINGS } from '@/declarations/system/realtime'
import type { RealtimeFrame } from '@/declarations/system/realtime'
import { ErrorCodes } from '@/utils/constants/errors'
import { SECOND_MS } from '@/utils/constants/time'

// Longest topic name accepted
const MAX_TOPIC_LENGTH = 160

/**
 * Socket with what it follows
 * @typedef {Object} LiveConnection
 */

export interface LiveConnection extends RealtimeConnection {
  // Stop per topic, a pending open holds a placeholder
  topics: Map<string, () => void>
}

/**
 * What a socket can reach
 * @typedef {Object} RealtimeRegistry
 */

export interface RealtimeRegistry {
  topics: RealtimeTopic[]
  requests: Record<string, RealtimeRequest>
}

/**
 * Follow a topic once, a refusal stays silent
 * @param {LiveConnection} live - Socket
 * @param {string} topic - Topic
 * @param {RealtimeRegistry} registry - Reachable topics
 * @return {void}
 */

const follow = (live: LiveConnection, topic: string, registry: RealtimeRegistry): void => {
  if (live.topics.has(topic) || topic.length > MAX_TOPIC_LENGTH) return
  const handler = registry.topics.find((entry) => entry.match(topic))
  if (!handler) return

  const placeholder = () => {}
  live.topics.set(topic, placeholder)
  handler.open(topic, live).then(
    (stop) => {
      // Left while opening
      if (live.topics.get(topic) === placeholder) live.topics.set(topic, stop)
      else stop()
    },
    (error: unknown) => {
      if (live.topics.get(topic) === placeholder) live.topics.delete(topic)
      // Refusals stay silent, breakage does not
      if (toAppError(error).code === ErrorCodes.SystemFailure)
        logger.error('[realtime] topic failed', error)
    }
  )
}

/**
 * Stop following a topic
 * @param {LiveConnection} live - Socket
 * @param {string} topic - Topic
 * @return {void}
 */

export const unfollow = (live: LiveConnection, topic: string): void => {
  live.topics.get(topic)?.()
  live.topics.delete(topic)
}

/**
 * Answer one request, failures shaped like the HTTP envelope
 * @param {LiveConnection} live - Socket
 * @param {RealtimeFrame} frame - Request
 * @param {RealtimeRegistry} registry - Reachable requests
 * @return {Promise<void>} - Answered
 */

const answer = async (
  live: LiveConnection,
  frame: RealtimeFrame,
  registry: RealtimeRegistry
): Promise<void> => {
  const reply = (body: Partial<RealtimeFrame>) =>
    live.send(JSON.stringify({ k: REALTIME_KINDS.answer, id: frame.id, ...body }))
  const request = registry.requests[frame.op ?? '']
  const startedAt = performance.now()

  try {
    if (!request) throw notFound()
    reply({ d: (await request(live.session, frame.d, live)) ?? null })
  } catch (error) {
    const failure = toAppError(error)
    if (failure.code === ErrorCodes.SystemFailure)
      logger.error(`[realtime] ${frame.op} failed`, error)
    reply({ err: { message: failure.message, code: failure.code, issues: failure.issues } })
  }

  // Slow answers named, never their content
  const elapsed = Math.round(performance.now() - startedAt)
  if (elapsed > REALTIME_SETTINGS.slowRequestMs)
    logger.warn(`[realtime] ${frame.op} took ${elapsed}ms`)
}

/**
 * Handle one frame from a browser
 * @param {LiveConnection} live - Socket
 * @param {RealtimeFrame} frame - Frame
 * @param {RealtimeRegistry} registry - Reachable topics and requests
 * @return {void}
 */

export const dispatchFrame = (
  live: LiveConnection,
  frame: RealtimeFrame,
  registry: RealtimeRegistry
): void => {
  const topic = typeof frame.t === 'string' ? frame.t : ''

  if (frame.k === REALTIME_KINDS.subscribe) follow(live, topic, registry)
  else if (frame.k === REALTIME_KINDS.unsubscribe) unfollow(live, topic)
  else if (frame.k === REALTIME_KINDS.ping) live.send(JSON.stringify({ k: REALTIME_KINDS.pong }))
  else if (frame.k === REALTIME_KINDS.request && typeof frame.id === 'number') {
    void answer(live, frame, registry)
  }
}

/**
 * Token bucket of a socket
 * @typedef {Object} FrameBudget
 */

export interface FrameBudget {
  tokens: number
  refilledAt: number
}

/**
 * Spend one frame of the budget
 * @param {FrameBudget} budget - Bucket
 * @return {boolean} - Frame allowed
 */

export const spendFrame = (budget: FrameBudget): boolean => {
  const rate = REALTIME_SETTINGS.messagesPerSecond
  const now = Date.now()
  budget.tokens = Math.min(rate, budget.tokens + ((now - budget.refilledAt) / SECOND_MS) * rate)
  budget.refilledAt = now
  if (budget.tokens < 1) return false
  budget.tokens -= 1

  return true
}
