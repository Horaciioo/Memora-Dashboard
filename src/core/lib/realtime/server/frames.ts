import 'server-only'

import { subscribeLive } from '@/core/lib/lives/bus'
import type { RealtimeConnection } from '@/core/lib/realtime/server/types'
import { REALTIME_KINDS } from '@/declarations/system/realtime'

// Fallback event of a signal without type
const DEFAULT_EVENT = 'changed'

// One text per signal and topic, for every reader
const written = new WeakMap<object, Map<string, string>>()

/**
 * Event frame of a topic
 * @param {string} topic - Topic
 * @param {string} event - Event name
 * @param {unknown} data - Payload
 * @return {string} - Frame text
 */

export const eventFrame = (topic: string, event: string, data: unknown): string =>
  JSON.stringify({ k: REALTIME_KINDS.event, t: topic, e: event, d: data })

/**
 * Event name a bus signal carries
 * @param {unknown} payload - Signal
 * @return {string} - Event
 */

export const eventOf = (payload: unknown): string => {
  const type = (payload as { type?: unknown } | null)?.type

  return typeof type === 'string' ? type : DEFAULT_EVENT
}

/**
 * Frame of a bus signal, written once whatever the readers
 * @param {string} topic - Topic
 * @param {unknown} payload - Signal
 * @return {string} - Frame text
 */

export const signalFrame = (topic: string, payload: unknown): string => {
  if (typeof payload !== 'object' || payload === null) {
    return eventFrame(topic, eventOf(payload), payload)
  }
  const byTopic = written.get(payload) ?? new Map<string, string>()
  written.set(payload, byTopic)
  const known = byTopic.get(topic)
  if (known) return known
  const frame = eventFrame(topic, eventOf(payload), payload)
  byTopic.set(topic, frame)

  return frame
}

/**
 * Hand every signal of a bus topic to one socket
 * @param {string} topic - Topic
 * @param {RealtimeConnection} connection - Socket
 * @param {(payload: unknown) => boolean} [accept] - Signals let through
 * @return {() => void} - Stops
 */

export const forwardTopic = (
  topic: string,
  connection: RealtimeConnection,
  accept: (payload: unknown) => boolean = () => true
): (() => void) =>
  subscribeLive(topic, (payload) => {
    if (accept(payload)) connection.send(signalFrame(topic, payload))
  })
