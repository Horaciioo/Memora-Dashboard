import type { IncomingMessage } from 'node:http'
import type { Duplex } from 'node:stream'

import { acceptSocket } from './socket.ts'
import type { FakeSocket } from './socket.ts'
import { nextId } from './world.ts'

/**
 * One subscription of a session
 * @typedef {Object} Subscription
 */

export interface Subscription {
  id: string
  type: string
  version: string
  condition: Record<string, string>
  createdAt: string
}

interface Session {
  id: string
  socket: FakeSocket | null
  keepaliveSeconds: number
  subscriptions: Subscription[]
  lastSentAt: number
  timer: ReturnType<typeof setInterval> | null
}

const sessions = new Map<string, Session>()
const subscribedListeners: ((subscription: Subscription) => void)[] = []

// Default keepalive asked by Twitch
const DEFAULT_KEEPALIVE_SECONDS = 10

/**
 * Send one frame on a session
 * @param {Session} session - Session
 * @param {string} type - Message type
 * @param {Record<string, unknown>} payload - Payload
 * @param {Record<string, string>} [extra] - Extra metadata
 * @return {void}
 */

const sendFrame = (
  session: Session,
  type: string,
  payload: Record<string, unknown>,
  extra: Record<string, string> = {}
): void => {
  session.lastSentAt = Date.now()
  session.socket?.send(
    JSON.stringify({
      metadata: {
        message_id: nextId(),
        message_type: type,
        message_timestamp: new Date().toISOString(),
        ...extra,
      },
      payload,
    })
  )
}

/**
 * Keep a quiet session alive
 * @param {Session} session - Session
 * @return {void}
 */

const armKeepalive = (session: Session): void => {
  if (session.timer) clearInterval(session.timer)

  // Twitch speaks before the window closes
  session.timer = setInterval(() => {
    const quietFor = Date.now() - session.lastSentAt
    if (quietFor >= (session.keepaliveSeconds - 2) * 1000)
      sendFrame(session, 'session_keepalive', {})
  }, 1000)
}

/**
 * Attach a socket to a new or resumed session
 * @param {FakeSocket} socket - Socket
 * @param {URL} url - Request URL
 * @return {Session} - Session
 */

const openSession = (socket: FakeSocket, url: URL): Session => {
  const resumed = sessions.get(url.searchParams.get('reconnect') ?? '')
  const asked = Number(url.searchParams.get('keepalive_timeout_seconds'))
  const session: Session = resumed ?? {
    id: nextId(),
    socket: null,
    keepaliveSeconds: Number.isFinite(asked) && asked >= 10 ? asked : DEFAULT_KEEPALIVE_SECONDS,
    subscriptions: [],
    lastSentAt: Date.now(),
    timer: null,
  }

  // The old socket is closed by the client
  session.socket = socket
  sessions.set(session.id, session)
  socket.onClose(() => {
    if (session.socket !== socket) return
    if (session.timer) clearInterval(session.timer)
    sessions.delete(session.id)
  })

  return session
}

/**
 * Accept an EventSub socket
 * @param {IncomingMessage} request - Upgrade request
 * @param {Duplex} stream - Raw socket
 * @return {void}
 */

export const acceptEventSub = (request: IncomingMessage, stream: Duplex): void => {
  const socket = acceptSocket(request, stream)
  if (!socket) return

  const session = openSession(socket, new URL(request.url ?? '/', 'http://localhost'))
  sendFrame(session, 'session_welcome', {
    session: {
      id: session.id,
      status: 'connected',
      connected_at: new Date().toISOString(),
      keepalive_timeout_seconds: session.keepaliveSeconds,
      reconnect_url: null,
    },
  })
  armKeepalive(session)
}

/**
 * Register a subscription on a session
 * @param {string} sessionId - Session
 * @param {Omit<Subscription, 'id' | 'createdAt'>} input - Subscription
 * @return {Subscription | null} - Subscription, or nothing if the session is gone
 */

export const subscribe = (
  sessionId: string,
  input: Omit<Subscription, 'id' | 'createdAt'>
): Subscription | null => {
  const session = sessions.get(sessionId)
  if (!session) return null

  const subscription = { ...input, id: nextId(), createdAt: new Date().toISOString() }
  session.subscriptions.push(subscription)
  subscribedListeners.forEach((listener) => listener(subscription))

  return subscription
}

/**
 * Listen to new subscriptions
 * @param {(subscription: Subscription) => void} listener - Listener
 * @return {void}
 */

export const onSubscribed = (listener: (subscription: Subscription) => void): void => {
  subscribedListeners.push(listener)
}

/**
 * Push one event to every matching subscription
 * @param {string} type - Subscription type
 * @param {Record<string, unknown>} event - Event payload
 * @return {number} - Notifications sent
 */

export const notify = (type: string, event: Record<string, unknown>): number => {
  const broadcasterId = String(event.broadcaster_user_id ?? '')
  let sent = 0

  for (const session of sessions.values()) {
    for (const subscription of session.subscriptions) {
      if (subscription.type !== type) continue
      if (subscription.condition.broadcaster_user_id !== broadcasterId) continue

      sendFrame(
        session,
        'notification',
        {
          subscription: {
            id: subscription.id,
            status: 'enabled',
            type,
            version: subscription.version,
            cost: 0,
            condition: subscription.condition,
            transport: { method: 'websocket', session_id: session.id },
            created_at: subscription.createdAt,
          },
          event,
        },
        { subscription_type: type, subscription_version: subscription.version }
      )
      sent += 1
    }
  }

  return sent
}

/**
 * Ask every session to move
 * @param {string} origin - Socket origin
 * @return {number} - Sessions asked
 */

export const askReconnect = (origin: string): number => {
  for (const session of sessions.values()) {
    sendFrame(session, 'session_reconnect', {
      session: {
        id: session.id,
        status: 'reconnecting',
        reconnect_url: `${origin}/ws?reconnect=${session.id}`,
        connected_at: new Date().toISOString(),
      },
    })
  }

  return sessions.size
}

/**
 * Drop every socket without warning
 * @return {number} - Sockets dropped
 */

export const killSockets = (): number => {
  const count = sessions.size
  for (const session of [...sessions.values()]) session.socket?.kill()

  return count
}

/**
 * Sessions open right now
 * @return {number} - Count
 */

export const sessionCount = (): number => sessions.size

/**
 * Whether anyone listens to a channel
 * @param {string} broadcasterId - Channel
 * @return {boolean} - Watched
 */

export const isWatched = (broadcasterId: string): boolean =>
  [...sessions.values()].some((session) =>
    session.subscriptions.some((entry) => entry.condition.broadcaster_user_id === broadcasterId)
  )
