import 'server-only'

import { NEXUS_REALTIME } from '@/declarations/nexus/modulesSettings'
import { MINUTE_MS } from '@/utils/constants/time'

/**
 * Event of a member's sockets
 * @typedef {Object} SocketEvent
 * @property {number} at - Epoch ms
 * @property {string} kind - What happened
 * @property {string} [detail] - Code or topic
 */

export interface SocketEvent {
  at: number
  kind: 'open' | 'close' | 'invalid' | 'flooded' | 'slow' | 'refused'
  detail?: string
}

// Survives dev hot reloads
const holder = globalThis as unknown as { socketJournal?: Map<string, SocketEvent[]> }

const journal: Map<string, SocketEvent[]> = (holder.socketJournal ??= new Map())

/**
 * Note an event on a member
 * @param {string} accountId - Member
 * @param {SocketEvent['kind']} kind - What happened
 * @param {string} [detail] - Code or topic
 * @return {number} - Opens in the last minute
 */

export const noteSocketEvent = (
  accountId: string,
  kind: SocketEvent['kind'],
  detail?: string
): number => {
  const now = Date.now()
  const horizon = now - NEXUS_REALTIME.eventsKeepMinutes * MINUTE_MS
  const kept = (journal.get(accountId) ?? []).filter((event) => event.at >= horizon)

  // Oldest leave first
  kept.push({ at: now, kind, detail })
  journal.set(accountId, kept.slice(-NEXUS_REALTIME.eventsPerAccount))

  return kept.filter((event) => event.kind === 'open' && event.at >= now - MINUTE_MS).length
}

/**
 * Events kept for a member
 * @param {string} accountId - Member
 * @param {number} [since] - Epoch ms floor
 * @return {SocketEvent[]} - Newest last
 */

export const readSocketEvents = (accountId: string, since = 0): SocketEvent[] =>
  (journal.get(accountId) ?? []).filter((event) => event.at >= since)
