import 'server-only'

import type { IncomingMessage } from 'node:http'
import type { RawData, WebSocket } from 'ws'

import { logger } from '@/core/lib/logger'
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
  socket: WebSocket
  isAlive: boolean
  budget: FrameBudget
}

/**
 * Hub the HTTP server hands its upgrades to
 * @typedef {Object} RealtimeHub
 */

export interface RealtimeHub {
  accept: (socket: WebSocket, request: IncomingMessage) => void
  close: () => void
  count: () => number
}

/**
 * Writer of a socket, dropping readers too far behind
 * @param {WebSocket} socket - Socket
 * @return {(frame: string) => void} - Writer
 */

const writerOf =
  (socket: WebSocket) =>
  (frame: string): void => {
    if (socket.readyState !== socket.OPEN) return
    if (socket.bufferedAmount > REALTIME_SETTINGS.slowKilobytes * 1024) {
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
    if (!spendFrame(held.budget)) return void socket.close(REALTIME_CLOSE.flooded)
    const frame = readFrame(raw)
    if (frame) dispatchFrame(held, frame, registry)
  })
  socket.on('error', () => socket.terminate())
  socket.once('close', () => {
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
        socket,
        session,
        send: writerOf(socket),
        topics: new Map(),
        isAlive: true,
        budget: { tokens: REALTIME_SETTINGS.messagesPerSecond, refilledAt: Date.now() },
      }
      sockets.add(held)
      wireSocket(held, sockets, registry)
    },
    close: () => {
      clearInterval(beat)
      for (const held of sockets) held.socket.close()
      logger.info('[realtime] hub closed')
    },
    count: () => sockets.size,
  }
}
