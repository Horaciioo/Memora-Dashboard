import 'server-only'

import type { IncomingMessage } from 'node:http'
import type { RawData, WebSocket } from 'ws'

import { randomUUID } from 'node:crypto'

import { logger } from '@/core/lib/logger'
import { noteSocketEvent } from '@/core/lib/realtime/server/journal'
import { recordError } from '@/core/services/system/ErrorEventService'
import { NEXUS_REALTIME } from '@/declarations/nexus/modulesSettings'
import { dispatchFrame, spendFrame, unfollow } from '@/core/lib/realtime/server/dispatch'
import type {
  FrameBudget,
  LiveConnection,
  RealtimeRegistry,
} from '@/core/lib/realtime/server/dispatch'
import { redeemTicket } from '@/core/lib/realtime/server/tickets'
import { REALTIME_CLOSE, REALTIME_SETTINGS } from '@/declarations/system/realtime'
import type { RealtimeFrame } from '@/declarations/system/realtime'
import { MINUTE_MS, SECOND_MS } from '@/utils/constants/time'

/**
 * Socket held by the hub
 * @typedef {Object} HeldSocket
 */

interface HeldSocket extends LiveConnection {
  id: string
  socket: WebSocket
  isAlive: boolean
  budget: FrameBudget
  openedAt: number
  lastSeenAt: number
  frames: number
}

/**
 * Socket as the console reads it
 * @typedef {Object} SocketSnapshot
 */

export interface SocketSnapshot {
  id: string
  accountId: string
  openedAt: string
  lastSeenAt: string
  topics: string[]
  bufferedKilobytes: number
  framesPerSecond: number
}

/**
 * Sockets and topics of this process
 * @typedef {Object} HubSnapshot
 */

export interface HubSnapshot {
  sockets: SocketSnapshot[]
  topics: Record<string, number>
}

/**
 * Hub the HTTP server hands its upgrades to
 * @typedef {Object} RealtimeHub
 */

export interface RealtimeHub {
  accept: (socket: WebSocket, request: IncomingMessage) => void
  close: () => void
  count: () => number
  snapshot: () => HubSnapshot
  disconnect: (socketId: string) => boolean
}

/**
 * Writer of a socket, dropping readers too far behind
 * @param {WebSocket} socket - Socket
 * @return {(frame: string) => void} - Writer
 */

const writerOf =
  (socket: WebSocket, accountId: string) =>
  (frame: string): void => {
    if (socket.readyState !== socket.OPEN) return
    if (socket.bufferedAmount > REALTIME_SETTINGS.slowKilobytes * 1024) {
      noteSocketEvent(accountId, 'slow')
      socket.close(REALTIME_CLOSE.slow)
      return
    }
    socket.send(frame)
  }

/**
 * Read one browser frame
 * @param {RawData} raw - Bytes
 * @return {RealtimeFrame | null} - Frame, null when unreadable
 */

const readFrame = (raw: RawData): RealtimeFrame | null => {
  try {
    const frame = JSON.parse(raw.toString()) as unknown

    return typeof frame === 'object' && frame !== null && 'k' in frame
      ? (frame as RealtimeFrame)
      : null
  } catch {
    return null
  }
}

/**
 * Wire one accepted socket
 * @param {HeldSocket} held - Socket
 * @param {Set<HeldSocket>} sockets - Open sockets
 * @param {RealtimeRegistry} registry - Reachable topics and requests
 * @return {void}
 */

const wireSocket = (
  held: HeldSocket,
  sockets: Set<HeldSocket>,
  registry: RealtimeRegistry
): void => {
  const { socket } = held
  // Rights read again with a fresh ticket
  const expiry = setTimeout(
    () => socket.close(REALTIME_CLOSE.expired),
    REALTIME_SETTINGS.sessionMaxMinutes * MINUTE_MS
  )

  socket.on('pong', () => {
    held.isAlive = true
  })
  socket.on('message', (raw) => {
    held.isAlive = true
    held.lastSeenAt = Date.now()
    held.frames += 1
    if (!spendFrame(held.budget)) {
      noteSocketEvent(held.session.id, 'flooded')
      return void socket.close(REALTIME_CLOSE.flooded)
    }
    const frame = readFrame(raw)
    if (frame) dispatchFrame(held, frame, registry)
    else noteSocketEvent(held.session.id, 'invalid')
  })
  socket.on('error', () => socket.terminate())
  socket.once('close', (code) => {
    noteSocketEvent(held.session.id, 'close', String(code))
    clearTimeout(expiry)
    sockets.delete(held)
    for (const topic of [...held.topics.keys()]) unfollow(held, topic)
  })
}

/**
 * Socket hub of this process
 * @param {RealtimeRegistry} registry - Reachable topics and requests
 * @return {RealtimeHub} - Hub
 */

export const createHub = (registry: RealtimeRegistry): RealtimeHub => {
  const sockets = new Set<HeldSocket>()

  // Silent sockets are dead ones
  const beat = setInterval(() => {
    for (const held of sockets) {
      if (!held.isAlive) {
        held.socket.terminate()
        continue
      }
      held.isAlive = false
      held.socket.ping()
    }
  }, REALTIME_SETTINGS.pingSeconds * SECOND_MS)
  beat.unref()

  return {
    accept: (socket, request) => {
      const url = new URL(request.url ?? '/', 'http://memora')
      const session = redeemTicket(url.searchParams.get('ticket'))
      if (!session) return void socket.close(REALTIME_CLOSE.refused)

      const held: HeldSocket = {
        id: randomUUID(),
        socket,
        session,
        send: writerOf(socket, session.id),
        openedAt: Date.now(),
        lastSeenAt: Date.now(),
        frames: 0,
        topics: new Map(),
        isAlive: true,
        budget: { tokens: REALTIME_SETTINGS.messagesPerSecond, refilledAt: Date.now() },
      }
      sockets.add(held)
      wireSocket(held, sockets, registry)

      // A loop of reconnections is worth a line
      const opens = noteSocketEvent(session.id, 'open')
      if (opens > NEXUS_REALTIME.reconnectPerMinute) {
        void recordError({
          severity: 'WARNING',
          source: 'WEBSOCKET',
          message: 'Socket reconnecting in a loop',
          route: 'realtime.connect',
          accountId: session.id,
          context: { opensLastMinute: opens },
        })
      }
    },
    close: () => {
      clearInterval(beat)
      for (const held of sockets) held.socket.close()
      logger.info('[realtime] hub closed')
    },
    count: () => sockets.size,
    snapshot: () => {
      const now = Date.now()
      const topics: Record<string, number> = {}
      const rows = [...sockets].map((held) => {
        const names = [...held.topics.keys()]
        for (const name of names) topics[name] = (topics[name] ?? 0) + 1

        return {
          id: held.id,
          accountId: held.session.id,
          openedAt: new Date(held.openedAt).toISOString(),
          lastSeenAt: new Date(held.lastSeenAt).toISOString(),
          topics: names,
          bufferedKilobytes: Math.round(held.socket.bufferedAmount / 1024),
          framesPerSecond: Number(
            (held.frames / Math.max(1, (now - held.openedAt) / SECOND_MS)).toFixed(2)
          ),
        }
      })

      return { sockets: rows, topics }
    },
    disconnect: (socketId) => {
      const held = [...sockets].find((candidate) => candidate.id === socketId)
      held?.socket.close(REALTIME_CLOSE.owner)

      return Boolean(held)
    },
  }
}
