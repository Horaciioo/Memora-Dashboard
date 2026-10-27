import realtime from '@/configurations/system/temps-reel.json'
import { readInteger, readString } from '@/declarations/configurations/readers'

// Config path of a key
const at = (key: string) => `system/temps-reel.${key}`

/**
 * Socket pacing and limits, read by the browser and the server
 * @type {Record<string, number | string>}
 */

export const REALTIME_SETTINGS = {
  // Upgrade route, outside the App Router
  path: readString(realtime.path, { path: at('path'), fallback: '/api/temps-reel' }),
  ticketSeconds: readInteger(realtime.ticketSeconds, {
    path: at('ticketSeconds'),
    fallback: 30,
    min: 5,
  }),
  maxPayloadKilobytes: readInteger(realtime.maxPayloadKilobytes, {
    path: at('maxPayloadKilobytes'),
    fallback: 64,
    min: 1,
  }),
  // Below the 100s idle cut of Cloudflare
  pingSeconds: readInteger(realtime.pingSeconds, { path: at('pingSeconds'), fallback: 20, min: 5 }),
  deadSeconds: readInteger(realtime.deadSeconds, {
    path: at('deadSeconds'),
    fallback: 45,
    min: 10,
  }),
  reconnectBaseMs: readInteger(realtime.reconnectBaseMs, {
    path: at('reconnectBaseMs'),
    fallback: 200,
    min: 50,
  }),
  reconnectMaxMs: readInteger(realtime.reconnectMaxMs, {
    path: at('reconnectMaxMs'),
    fallback: 5000,
    min: 500,
  }),
  // Socket kept a moment between two pages
  idleCloseSeconds: readInteger(realtime.idleCloseSeconds, {
    path: at('idleCloseSeconds'),
    fallback: 20,
    min: 1,
  }),
  // Rights read again past this
  sessionMaxMinutes: readInteger(realtime.sessionMaxMinutes, {
    path: at('sessionMaxMinutes'),
    fallback: 30,
    min: 1,
  }),
  // Reader this far behind is dropped
  slowKilobytes: readInteger(realtime.slowKilobytes, {
    path: at('slowKilobytes'),
    fallback: 1024,
    min: 64,
  }),
  messagesPerSecond: readInteger(realtime.messagesPerSecond, {
    path: at('messagesPerSecond'),
    fallback: 40,
    min: 1,
  }),
  requestTimeoutSeconds: readInteger(realtime.requestTimeoutSeconds, {
    path: at('requestTimeoutSeconds'),
    fallback: 10,
    min: 1,
  }),
  // Page refreshes in a burst merged
  refreshCoalesceMs: readInteger(realtime.refreshCoalesceMs, {
    path: at('refreshCoalesceMs'),
    fallback: 120,
    min: 0,
  }),
}

/**
 * Message kinds of the socket
 * @type {Record<string, string>}
 */

export const REALTIME_KINDS = {
  subscribe: 'sub',
  unsubscribe: 'unsub',
  request: 'req',
  answer: 'ack',
  event: 'ev',
  ping: 'ping',
  pong: 'pong',
} as const

/**
 * Events the socket raises itself
 * @type {Record<string, string>}
 */

export const REALTIME_EVENTS = {
  // Socket back after a drop, missed signals to catch up
  resync: 'resync',
} as const

/**
 * Close codes of the socket
 * @type {Record<string, number>}
 */

export const REALTIME_CLOSE = {
  refused: 4401,
  // Rights read again with a new ticket
  expired: 4000,
  slow: 4008,
  flooded: 4029,
} as const

/**
 * Requests the socket answers
 * @type {Record<string, string>}
 */

export const REALTIME_OPS = {
  playAct: 'play:act',
} as const

export type RealtimeOp = (typeof REALTIME_OPS)[keyof typeof REALTIME_OPS]

/**
 * One frame on the wire
 * @typedef {Object} RealtimeFrame
 */

export interface RealtimeFrame {
  k: string
  t?: string
  e?: string
  id?: number
  op?: string
  d?: unknown
  err?: { message: string; code: string; issues?: { field?: string; message: string }[] }
}
