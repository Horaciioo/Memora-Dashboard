import type { SessionUser } from '@/types/auth'

/**
 * One open socket, as topics see it
 * @typedef {Object} RealtimeConnection
 * @property {SessionUser} session - Member of the ticket
 * @property {(frame: string) => void} send - Write a ready frame
 */

export interface RealtimeConnection {
  session: SessionUser
  send: (frame: string) => void
}

/**
 * Topics a socket can follow
 * @typedef {Object} RealtimeTopic
 * @property {(topic: string) => boolean} match - Handles this topic
 * @property {(topic: string, connection: RealtimeConnection) => Promise<() => void>} open - Follow it, throws to refuse
 */

export interface RealtimeTopic {
  match: (topic: string) => boolean
  open: (topic: string, connection: RealtimeConnection) => Promise<() => void>
}

/**
 * Request answered over the socket
 * @typedef {Function} RealtimeRequest
 */

export type RealtimeRequest = (
  session: SessionUser,
  data: unknown,
  connection: RealtimeConnection
) => Promise<unknown>
