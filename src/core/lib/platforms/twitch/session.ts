import { logger } from '@/core/lib/logger'
import { PlatformError } from '@/core/lib/platforms/http'
import { translateTwitchEvent } from '@/core/lib/platforms/twitch/eventsub'
import type { TwitchSignal } from '@/core/lib/platforms/twitch/eventsub'
import { runHelix } from '@/core/lib/platforms/twitch/helix'
import {
  HELIX_PATHS,
  TWITCH_ENDPOINTS,
  TWITCH_SUBSCRIPTIONS,
} from '@/declarations/platforms/twitch'

/**
 * Where a session stands
 * @typedef {'connecting' | 'connected' | 'disconnected'} SessionState
 */

export type SessionState = 'connecting' | 'connected' | 'disconnected'

/**
 * What a session needs
 * @typedef {Object} EventSubOptions
 * @property {() => Promise<{ accessToken: string, moderatorId: string } | null>} seat - Token of the watching moderator, read fresh
 * @property {string} broadcasterId - Channel watched
 * @property {number} keepaliveSeconds - Asked keepalive window
 * @property {(signal: TwitchSignal) => void} onSignal - Called per translated signal
 * @property {(state: SessionState) => void} onState - Called on each state change
 */

export interface EventSubOptions {
  seat: () => Promise<{ accessToken: string; moderatorId: string } | null>
  broadcasterId: string
  keepaliveSeconds: number
  onSignal: (signal: TwitchSignal) => void
  onState: (state: SessionState) => void
}

// Notification identifiers remembered against redelivery
const SEEN_LIMIT = 2000

// Extra seconds tolerated past the keepalive window
const KEEPALIVE_SLACK_SECONDS = 5

// Reconnection delays, the last one repeated
const BACKOFF_SECONDS = [1, 2, 5, 10, 30]

type Frame = {
  metadata?: {
    message_id?: string
    message_type?: string
    message_timestamp?: string
    subscription_type?: string
  }
  payload?: {
    session?: { id?: string; reconnect_url?: string | null }
    subscription?: { type?: string; status?: string }
    event?: Record<string, unknown>
  }
}

/**
 * One EventSub WebSocket session watching a channel for one live
 * @typedef {Object} EventSubSession
 */

export class EventSubSession {
  private readonly options: EventSubOptions
  private socket: WebSocket | null = null
  private watchdog: ReturnType<typeof setTimeout> | null = null
  private retry: ReturnType<typeof setTimeout> | null = null
  private attempts = 0
  private stopped = false
  private readonly seen = new Set<string>()
  // Socket opened on a reconnect, adopted once welcomed
  private pending: WebSocket | null = null

  constructor(options: EventSubOptions) {
    this.options = options
  }

  /**
   * Open the session
   * @return {void}
   */

  start(): void {
    this.stopped = false
    this.open(
      `${TWITCH_ENDPOINTS.eventsub}?keepalive_timeout_seconds=${this.options.keepaliveSeconds}`,
      false
    )
  }

  /**
   * Close the session, its subscriptions die with it
   * @return {void}
   */

  stop(): void {
    this.stopped = true
    this.clearTimers()
    this.socket?.close()
    this.socket = null
    this.options.onState('disconnected')
  }

  /**
   * Connect one socket, a reconnect keeping the old one until welcomed
   * @param {string} url - Socket URL
   * @param {boolean} isReconnect - Asked by Twitch
   * @return {void}
   */

  private open(url: string, isReconnect: boolean): void {
    if (this.stopped) return
    if (!isReconnect) this.options.onState('connecting')

    const previous = isReconnect ? this.socket : null
    const socket = new WebSocket(url)

    socket.addEventListener('message', (message) => {
      // Ignore a socket that was replaced
      if (this.socket !== socket && this.socket !== previous) return
      void this.read(socket, previous, String(message.data))
    })
    socket.addEventListener('close', () => {
      if (this.socket !== socket || this.stopped) return
      this.options.onState('disconnected')
      this.scheduleRetry()
    })
    socket.addEventListener('error', () => {
      logger.warn('[eventsub] socket error')
    })

    if (!isReconnect) this.socket = socket
    else this.pending = socket
  }

  /**
   * Handle one frame
   * @param {WebSocket} socket - Receiving socket
   * @param {WebSocket | null} previous - Socket being replaced
   * @param {string} raw - Frame text
   * @return {Promise<void>} - Handled
   */

  private async read(socket: WebSocket, previous: WebSocket | null, raw: string): Promise<void> {
    let frame: Frame
    try {
      frame = JSON.parse(raw) as Frame
    } catch {
      return
    }

    const type = frame.metadata?.message_type
    this.arm()

    switch (type) {
      case 'session_welcome': {
        const sessionId = frame.payload?.session?.id ?? ''

        // A reconnect keeps its subscriptions, the old socket can go
        if (this.pending === socket) {
          this.socket = socket
          this.pending = null
          previous?.close()
        } else {
          await this.subscribe(sessionId)
        }

        this.attempts = 0
        this.options.onState('connected')
        return
      }
      case 'session_reconnect': {
        const url = frame.payload?.session?.reconnect_url
        if (url) this.open(url, true)
        return
      }
      case 'notification': {
        const id = frame.metadata?.message_id ?? ''
        if (!id || this.seen.has(id)) return
        this.remember(id)

        const signals = translateTwitchEvent(
          frame.metadata?.subscription_type ?? frame.payload?.subscription?.type ?? '',
          frame.payload?.event ?? {},
          { id, at: frame.metadata?.message_timestamp ?? new Date().toISOString() }
        )
        signals.forEach((signal) => this.options.onSignal(signal))
        return
      }
      case 'revocation':
        logger.warn('[eventsub] subscription revoked', frame.payload?.subscription?.type ?? '')
        return
      default:
        return
    }
  }

  /**
   * Open every subscription of the Mod View on the session
   * @param {string} sessionId - Session identifier
   * @return {Promise<void>} - Subscribed, failures logged
   */

  private async subscribe(sessionId: string): Promise<void> {
    const seat = await this.options.seat()
    if (!seat) {
      this.stop()
      return
    }

    // In parallel, Twitch leaves ten seconds after the welcome
    const results = await Promise.allSettled(
      TWITCH_SUBSCRIPTIONS.map((subscription) =>
        runHelix(seat, {
          method: 'POST',
          path: HELIX_PATHS.subscriptions,
          query: {},
          body: {
            type: subscription.type,
            version: subscription.version,
            condition: {
              broadcaster_user_id: this.options.broadcasterId,
              ...(subscription.holder === 'user' ? { user_id: seat.moderatorId } : {}),
              ...(subscription.holder === 'moderator'
                ? { moderator_user_id: seat.moderatorId }
                : {}),
            },
            transport: { method: 'websocket', session_id: sessionId },
          },
        })
      )
    )

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') return
      const status = result.reason instanceof PlatformError ? result.reason.status : 0
      logger.warn(`[eventsub] ${TWITCH_SUBSCRIPTIONS[index]?.type} not subscribed (${status})`)
    })
  }

  /**
   * Remember one notification, forgetting the oldest
   * @param {string} id - Message identifier
   * @return {void}
   */

  private remember(id: string): void {
    this.seen.add(id)
    if (this.seen.size <= SEEN_LIMIT) return

    const oldest = this.seen.values().next().value
    if (oldest) this.seen.delete(oldest)
  }

  /**
   * Restart the silence watchdog
   * @return {void}
   */

  private arm(): void {
    if (this.watchdog) clearTimeout(this.watchdog)
    this.watchdog = setTimeout(
      () => {
        // Silence past the keepalive window means a dead socket
        logger.warn('[eventsub] keepalive missed, reconnecting')
        this.socket?.close()
        this.socket = null
        this.options.onState('disconnected')
        this.scheduleRetry()
      },
      (this.options.keepaliveSeconds + KEEPALIVE_SLACK_SECONDS) * 1000
    )
  }

  /**
   * Reconnect after a backoff
   * @return {void}
   */

  private scheduleRetry(): void {
    if (this.stopped || this.retry) return

    const delay = BACKOFF_SECONDS[Math.min(this.attempts, BACKOFF_SECONDS.length - 1)] ?? 30
    this.attempts += 1
    this.retry = setTimeout(() => {
      this.retry = null
      this.start()
    }, delay * 1000)
  }

  /**
   * Drop every timer
   * @return {void}
   */

  private clearTimers(): void {
    if (this.watchdog) clearTimeout(this.watchdog)
    if (this.retry) clearTimeout(this.retry)
    this.watchdog = null
    this.retry = null
  }
}
