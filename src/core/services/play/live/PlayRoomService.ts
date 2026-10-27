import 'server-only'

import { subscribeLive } from '@/core/lib/lives/bus'
import { logger } from '@/core/lib/logger'
import { toEngineSession } from '@/core/lib/play/session'
import { watchSession } from '@/core/lib/play/watchers'
import { eventFrame, eventOf, signalFrame } from '@/core/lib/realtime/server/frames'
import type { RealtimeConnection } from '@/core/lib/realtime/server/types'
import { engineOf, loadSession } from '@/core/services/play/PlaySessionService'
import { PLAY_STREAM_EVENTS, PLAY_TOPICS } from '@/declarations/play/topics'
import { PlayStatuses } from '@/utils/constants/play'

/**
 * Sockets following one game on this process
 * @typedef {Object} PlayRoom
 */

interface PlayRoom {
  members: Set<RealtimeConnection>
  stopBus: () => void
  // One push in flight, one queued behind it
  isPushing: boolean
  isQueued: boolean
}

// Survives dev hot reloads
const globalForRooms = globalThis as unknown as { playRooms?: Map<string, PlayRoom> }

const rooms = (globalForRooms.playRooms ??= new Map())

// Signals handed on as they are, the board goes on its own
const FORWARDED: string[] = [PLAY_STREAM_EVENTS.changed, PLAY_STREAM_EVENTS.chat]

/**
 * Read the game once, then send each reader its own board
 * @param {string} sessionId - Game
 * @param {PlayRoom} room - Readers
 * @return {Promise<void>} - Sent
 */

const sendBoards = async (sessionId: string, room: PlayRoom): Promise<void> => {
  const session = await loadSession(sessionId)
  if (session.status === PlayStatuses.Lobby) return

  const engine = engineOf(session.game)
  const table = toEngineSession(session)
  const topic = PLAY_TOPICS.session(sessionId)
  // One view per member, whatever their tabs
  const byViewer = new Map<string, RealtimeConnection[]>()
  for (const member of room.members) {
    byViewer.set(member.session.id, [...(byViewer.get(member.session.id) ?? []), member])
  }

  await Promise.all(
    [...byViewer].map(async ([viewerId, members]) => {
      const board = await engine.view(table, viewerId)
      const frame = eventFrame(topic, PLAY_STREAM_EVENTS.board, { board })
      for (const member of members) member.send(frame)
    })
  )
}

/**
 * Push boards, signals in a burst merged into the latest read
 * @param {string} sessionId - Game
 * @param {PlayRoom} room - Readers
 * @return {Promise<void>} - Pushed
 */

const pushBoards = async (sessionId: string, room: PlayRoom): Promise<void> => {
  if (room.isPushing) {
    room.isQueued = true
    return
  }
  room.isPushing = true
  do {
    room.isQueued = false
    try {
      await sendBoards(sessionId, room)
    } catch (error) {
      logger.warn('[play] board push failed', error)
    }
  } while (room.isQueued && room.members.size > 0)
  room.isPushing = false
}

/**
 * Open the room of a game on this process
 * @param {string} sessionId - Game
 * @return {PlayRoom} - Room
 */

const openRoom = (sessionId: string): PlayRoom => {
  const topic = PLAY_TOPICS.session(sessionId)
  const room: PlayRoom = {
    members: new Set(),
    stopBus: () => {},
    isPushing: false,
    isQueued: false,
  }

  room.stopBus = subscribeLive(topic, (payload) => {
    const event = eventOf(payload)
    if (FORWARDED.includes(event)) {
      const frame = signalFrame(topic, payload)
      for (const member of room.members) member.send(frame)
    }
    if (event !== PLAY_STREAM_EVENTS.chat) void pushBoards(sessionId, room)
  })
  rooms.set(sessionId, room)

  return room
}

/**
 * Follow a game: boards pushed on each move, the reader counted in the stands
 * @param {string} sessionId - Game
 * @param {RealtimeConnection} connection - Socket
 * @return {Promise<() => void>} - Leave
 */

export const joinPlayRoom = async (
  sessionId: string,
  connection: RealtimeConnection
): Promise<() => void> => {
  // Unknown games refuse the socket
  await loadSession(sessionId)
  const room = rooms.get(sessionId) ?? openRoom(sessionId)
  room.members.add(connection)
  const watch = new AbortController()
  watchSession(sessionId, connection.session.id, watch.signal)
  // The newcomer's board, missed moves included
  void pushBoards(sessionId, room)

  return () => {
    watch.abort()
    room.members.delete(connection)
    if (room.members.size > 0 || rooms.get(sessionId) !== room) return
    room.stopBus()
    rooms.delete(sessionId)
  }
}
