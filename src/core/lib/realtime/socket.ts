import { ApiClientError, apiGet } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import {
  REALTIME_CLOSE,
  REALTIME_EVENTS,
  REALTIME_KINDS,
  REALTIME_SETTINGS,
} from '@/declarations/system/realtime'
import type { RealtimeFrame, RealtimeOp } from '@/declarations/system/realtime'
import { ERROR_MESSAGES, ErrorCodes } from '@/utils/constants/errors'
import { SECOND_MS } from '@/utils/constants/time'

/**
 * Listener of one topic
 * @typedef {Function} RealtimeHandler
 */

export type RealtimeHandler = (event: string, data: unknown) => void

/**
 * Request waiting for its answer
 * @typedef {Object} PendingRequest
 */

interface PendingRequest {
  resolve: (data: unknown) => void
  reject: (error: Error) => void
  timer: number
}

// One socket per tab, shared by every topic
const state = {
  socket: null as WebSocket | null,
  isOpen: false,
  isConnecting: false,
  // Reconnects after a drop raise a resync
  hasOpened: false,
  attempt: 0,
  heardAt: 0,
  nextId: 1,
  retryTimer: 0,
  idleTimer: 0,
  beatTimer: 0,
  topics: new Map<string, Set<RealtimeHandler>>(),
  pending: new Map<number, PendingRequest>(),
  watchers: new Set<() => void>(),
}

// Open state moved
const notify = (): void => {
  for (const watcher of [...state.watchers]) watcher()
}

/**
 * Write a frame when the socket is open
 * @param {RealtimeFrame} frame - Frame
 * @return {boolean} - Sent
 */

const write = (frame: RealtimeFrame): boolean => {
  if (!state.isOpen || !state.socket) return false
  state.socket.send(JSON.stringify(frame))

  return true
}

/**
 * Hand an event to a topic's listeners
 * @param {string} topic - Topic
 * @param {string} event - Event
 * @param {unknown} data - Payload
 * @return {void}
 */

const emit = (topic: string, event: string, data: unknown): void => {
  for (const handler of [...(state.topics.get(topic) ?? [])]) handler(event, data)
}

/**
 * Settle a request with its answer
 * @param {RealtimeFrame} frame - Answer
 * @return {void}
 */

const settle = (frame: RealtimeFrame): void => {
  const pending = state.pending.get(frame.id ?? -1)
  if (!pending) return
  state.pending.delete(frame.id ?? -1)
  window.clearTimeout(pending.timer)
  if (frame.err) {
    pending.reject(new ApiClientError(frame.err.message, frame.err.code, frame.err.issues))
  } else pending.resolve(frame.d)
}

/**
 * Read one server frame
 * @param {MessageEvent<string>} message - Frame text
 * @return {void}
 */

const onMessage = (message: MessageEvent<string>): void => {
  state.heardAt = Date.now()
  const frame = JSON.parse(message.data) as RealtimeFrame
  if (frame.k === REALTIME_KINDS.event && frame.t) emit(frame.t, frame.e ?? '', frame.d)
  else if (frame.k === REALTIME_KINDS.answer) settle(frame)
}

/**
 * Next wait before reconnecting, doubled and spread
 * @return {number} - Milliseconds
 */

const backoff = (): number => {
  const { reconnectBaseMs, reconnectMaxMs } = REALTIME_SETTINGS
  const ceiling = Math.min(reconnectMaxMs, reconnectBaseMs * 2 ** state.attempt)
  state.attempt += 1

  return ceiling / 2 + Math.random() * (ceiling / 2)
}

/**
 * Forget the socket, then come back while topics remain
 * @param {boolean} [isNow] - Reconnect without waiting
 * @return {void}
 */

const drop = (isNow = false): void => {
  const { socket } = state
  const wasOpen = state.isOpen
  state.socket = null
  state.isOpen = false
  if (wasOpen) notify()
  state.isConnecting = false
  window.clearInterval(state.beatTimer)
  if (socket) {
    socket.onopen = socket.onmessage = socket.onclose = null
    socket.close()
  }
  for (const [id, pending] of state.pending) {
    window.clearTimeout(pending.timer)
    pending.reject(new ApiClientError(ERROR_MESSAGES[ErrorCodes.TimedOut], ErrorCodes.TimedOut))
    state.pending.delete(id)
  }
  if (!state.topics.size) return
  window.clearTimeout(state.retryTimer)
  state.retryTimer = window.setTimeout(connect, isNow ? 0 : backoff())
}

/**
 * Ping the server, a silent socket is dropped
 * @return {void}
 */

const beat = (): void => {
  if (Date.now() - state.heardAt > REALTIME_SETTINGS.deadSeconds * SECOND_MS) drop(true)
  else write({ k: REALTIME_KINDS.ping })
}

/**
 * Socket open: follow every topic again, catch up after a drop
 * @return {void}
 */

const onOpen = (): void => {
  const isBack = state.hasOpened
  state.isOpen = true
  state.isConnecting = false
  state.hasOpened = true
  state.attempt = 0
  state.heardAt = Date.now()
  state.beatTimer = window.setInterval(beat, REALTIME_SETTINGS.pingSeconds * SECOND_MS)
  for (const topic of state.topics.keys()) write({ k: REALTIME_KINDS.subscribe, t: topic })
  notify()
  if (isBack) for (const topic of state.topics.keys()) emit(topic, REALTIME_EVENTS.resync, null)
}

/**
 * Open the socket with a fresh ticket
 * @return {Promise<void>} - Opening
 */

async function connect(): Promise<void> {
  if (state.socket || state.isConnecting || !state.topics.size) return
  state.isConnecting = true

  const ticket = await apiGet<{ ticket: string }>(API_ROUTES.realtimeTicket).catch(() => null)
  if (!ticket || !state.topics.size) return drop()

  const scheme = window.location.protocol === 'https:' ? 'wss' : 'ws'
  const query = new URLSearchParams({ ticket: ticket.ticket })
  const socket = new WebSocket(
    `${scheme}://${window.location.host}${REALTIME_SETTINGS.path}?${query}`
  )
  state.socket = socket
  socket.onopen = onOpen
  socket.onmessage = onMessage
  socket.onclose = (event) => drop(event.code === REALTIME_CLOSE.expired)
}

// Back on the tab or the network, no waiting
const wake = () => {
  if (state.isOpen || !state.topics.size) return
  state.attempt = 0
  window.clearTimeout(state.retryTimer)
  if (!state.isConnecting) void connect()
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', wake)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') wake()
  })
}

/**
 * Listen to a topic over the shared socket
 * @param {string} topic - Topic
 * @param {RealtimeHandler} handler - Listener
 * @return {() => void} - Stop listening
 */

export const listenRealtime = (topic: string, handler: RealtimeHandler): (() => void) => {
  window.clearTimeout(state.idleTimer)
  const handlers = state.topics.get(topic) ?? new Set<RealtimeHandler>()
  if (!handlers.size) {
    state.topics.set(topic, handlers)
    write({ k: REALTIME_KINDS.subscribe, t: topic })
  }
  handlers.add(handler)
  void connect()

  return () => {
    handlers.delete(handler)
    if (handlers.size) return
    state.topics.delete(topic)
    write({ k: REALTIME_KINDS.unsubscribe, t: topic })
    if (state.topics.size) return
    // Kept a moment for the next page
    state.idleTimer = window.setTimeout(() => {
      if (!state.topics.size) drop()
    }, REALTIME_SETTINGS.idleCloseSeconds * SECOND_MS)
  }
}

/**
 * Socket open right now
 * @return {boolean} - Open
 */

export const isRealtimeOpen = (): boolean => state.isOpen

/**
 * Watch the socket open and close
 * @param {() => void} watcher - Called on change
 * @return {() => void} - Stop watching
 */

export const watchRealtime = (watcher: () => void): (() => void) => {
  state.watchers.add(watcher)

  return () => {
    state.watchers.delete(watcher)
  }
}

/**
 * Ask the server over the socket
 * @param {RealtimeOp} op - Request
 * @param {unknown} data - Body
 * @return {Promise<T>} - Answer, rejects like the API client
 */

export const requestRealtime = <T>(op: RealtimeOp, data: unknown): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const id = state.nextId++
    const timer = window.setTimeout(() => {
      state.pending.delete(id)
      reject(new ApiClientError(ERROR_MESSAGES[ErrorCodes.TimedOut], ErrorCodes.TimedOut))
    }, REALTIME_SETTINGS.requestTimeoutSeconds * SECOND_MS)
    state.pending.set(id, { resolve: (value) => resolve(value as T), reject, timer })
    if (!write({ k: REALTIME_KINDS.request, id, op, d: data })) {
      window.clearTimeout(timer)
      state.pending.delete(id)
      reject(new ApiClientError(ERROR_MESSAGES[ErrorCodes.TimedOut], ErrorCodes.TimedOut))
    }
  })
