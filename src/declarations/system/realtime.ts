import realtime from '@/configurations/system/temps-reel.json'
import { readInteger, readString } from '@/declarations/configurations/readers'

// Config path of a key
const at = (key: string) => `system/temps-reel.${key}`

// Positive integer setting
const integer = (key: keyof typeof realtime, fallback: number, min = 1) =>
  readInteger(realtime[key], { path: at(key), fallback, min })

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
  // Presence kept fresh past dozing tabs
  presenceBeatSeconds: integer('presenceBeatSeconds', 25, 5),
  presenceStaleSeconds: integer('presenceStaleSeconds', 150, 30),
  // Departed members shown faded
  presenceLingerSeconds: integer('presenceLingerSeconds', 30, 0),
  presenceSweepSeconds: integer('presenceSweepSeconds', 10, 1),
  presenceFlushMs: integer('presenceFlushMs', 150, 0),
  presenceIdleSeconds: integer('presenceIdleSeconds', 60, 5),
  presenceShown: integer('presenceShown', 4, 1),
  presencePreviewLength: integer('presencePreviewLength', 32, 8),
  presenceFlashMs: integer('presenceFlashMs', 1600, 100),
  // Keystrokes merged per frame sent
  docBatchMs: integer('docBatchMs', 30, 0),
  docAwareMs: integer('docAwareMs', 80, 0),
  // Database writes of a shared document
  docPersistMs: integer('docPersistMs', 1500, 100),
  docPersistMaxMs: integer('docPersistMaxMs', 8000, 500),
  docDeviceMs: integer('docDeviceMs', 800, 100),
  docUpdateMaxKilobytes: integer('docUpdateMaxKilobytes', 384, 16),
  // Logged past these
  slowRequestMs: integer('slowRequestMs', 250, 1),
  slowSaveMs: integer('slowSaveMs', 500, 1),
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
  // Who stands in a room
  presence: 'presence',
  // Seated on a shared document
  docReady: 'doc:ready',
  // Shared document change
  doc: 'doc',
  // Carets of a shared document
  aware: 'aware',
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
  presenceSet: 'presence:set',
  docSync: 'doc:sync',
  docUpdate: 'doc:update',
  docAware: 'doc:aware',
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
