import 'server-only'

import { publishLive } from '@/core/lib/lives/bus'
import { logger } from '@/core/lib/logger'
import { applySceneBatch, blankModView, shedChatBurst } from '@/core/lib/modview/feed'
import type { SceneEvent } from '@/core/lib/modview/scene'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'
import { LIVE_STREAM_EVENTS, LIVE_TOPICS } from '@/declarations/lives/topics'
import { runtime } from '@/managers/infrastructure/Core/runtime'
import type { ModViewState } from '@/types/modview'
import { LivePlatforms } from '@/utils/constants/lives'

// A live's memory outlives it by a day at most
const ROOM_TTL_SECONDS = 86400

// Burst kept before a flush
const QUEUE_FACTOR = 4

/**
 * What a live remembers of its chat
 * @typedef {Object} RoomMemory
 * @property {number} seq - Last flush
 */

export type RoomMemory = Pick<ModViewState, 'messages' | 'acts' | 'held' | 'pinned' | 'viewers'> & {
  seq: number
}

/**
 * One live held in memory
 * @typedef {Object} LiveRoom
 */

interface LiveRoom {
  view: ModViewState
  queue: SceneEvent[]
  timer: ReturnType<typeof setTimeout> | null
  seq: number
  // Chatters who already spoke in this live
  seen: Set<string>
}

// Chatters remembered per live
const SEEN_LIMIT = 20_000

// Badges of people who never "arrive"
const REGULAR_BADGES = ['broadcaster', 'moderator', 'bot']

// Survives dev hot reloads
const globalForRooms = globalThis as unknown as { liveRooms?: Map<string, LiveRoom> }

const rooms = (globalForRooms.liveRooms ??= new Map())

/**
 * Redis client with its namespace
 * @param {string} liveId - Live
 * @return {{ cache: NonNullable<ReturnType<NonNullable<ReturnType<typeof runtime>>['redis']['cache']>>, key: string } | null} - Client
 */

const shared = (liveId: string) => {
  const container = runtime()
  const cache = container?.redis.isReady() ? container.redis.cache : null

  return cache ? { cache, key: `${container!.redis.prefix}${LIVE_TOPICS.room(liveId)}` } : null
}

/**
 * Memory part of a room
 * @param {LiveRoom} room - Room
 * @return {RoomMemory} - Memory
 */

const memoryOf = (room: LiveRoom): RoomMemory => ({
  messages: room.view.messages,
  acts: room.view.acts,
  held: room.view.held,
  pinned: room.view.pinned,
  viewers: room.view.viewers,
  seq: room.seq,
})

/**
 * Room of a live, opened on first use
 * @param {string} liveId - Live
 * @return {LiveRoom} - Room
 */

const roomOf = (liveId: string): LiveRoom => {
  const known = rooms.get(liveId)
  if (known) return known

  // Clock start keeps flushes rising across restarts
  const room: LiveRoom = {
    view: blankModView({
      platform: LivePlatforms.Twitch,
      name: '',
      avatar: null,
      title: '',
      liveconLevel: null,
    }),
    queue: [],
    timer: null,
    seq: Date.now(),
    seen: new Set(),
  }
  rooms.set(liveId, room)

  return room
}

/**
 * Send what a room gathered
 * @param {string} liveId - Live
 * @param {LiveRoom} room - Room
 * @return {Promise<void>} - Sent
 */

const flushRoom = async (liveId: string, room: LiveRoom): Promise<void> => {
  room.timer = null
  const events = shedChatBurst(room.queue)
  room.queue = []
  if (!events.length) return

  room.seq += 1
  room.view = applySceneBatch(room.view, events)
  await publishLive(LIVE_TOPICS.live(liveId), {
    type: LIVE_STREAM_EVENTS.batch,
    seq: room.seq,
    events,
  })

  // Other instances read it
  const redis = shared(liveId)
  if (!redis) return
  await redis.cache
    .set(redis.key, JSON.stringify(memoryOf(room)), 'EX', ROOM_TTL_SECONDS)
    .catch((error: unknown) => logger.warn('[room] memory not shared', error))
}

/**
 * Mark the first line of a chatter in this live
 * @param {LiveRoom} room - Room
 * @param {SceneEvent} event - Event
 * @return {SceneEvent} - Event, marked when it opens a chatter's talk
 */

const markFirst = (room: LiveRoom, event: SceneEvent): SceneEvent => {
  if (event.kind !== 'message') return event

  const { author } = event.message
  if (room.seen.has(author.id) || room.seen.size >= SEEN_LIMIT) return event
  room.seen.add(author.id)
  if (author.badges.some((badge) => REGULAR_BADGES.includes(badge))) return event

  return { ...event, message: { ...event.message, isFirst: true } }
}

/**
 * Gather one Mod View event
 * @param {string} liveId - Live
 * @param {SceneEvent} event - Event
 * @return {void}
 */

export const pushRoomEvent = (liveId: string, event: SceneEvent): void => {
  const room = roomOf(liveId)
  room.queue.push(markFirst(room, event))

  // A stalled flush never piles up
  if (room.queue.length > LIVE_SETTINGS.roomMessages * QUEUE_FACTOR) {
    room.queue = shedChatBurst(room.queue)
  }

  room.timer ??= setTimeout(() => {
    void flushRoom(liveId, room).catch((error: unknown) =>
      logger.warn('[room] flush failed', error instanceof Error ? error.message : '')
    )
  }, LIVE_SETTINGS.feedFlushMs)
}

/**
 * Chat memory of a live
 * @param {string} liveId - Live
 * @return {Promise<RoomMemory | null>} - Memory
 */

export const readRoomMemory = async (liveId: string): Promise<RoomMemory | null> => {
  const room = rooms.get(liveId)
  if (room) return memoryOf(room)

  const redis = shared(liveId)
  const raw = redis ? await redis.cache.get(redis.key).catch(() => null) : null
  if (!raw) return null

  try {
    return JSON.parse(raw) as RoomMemory
  } catch {
    return null
  }
}

/**
 * Close a live's room
 * @param {string} liveId - Live
 * @return {Promise<void>} - Closed
 */

export const closeRoom = async (liveId: string): Promise<void> => {
  const room = rooms.get(liveId)
  if (room?.timer) clearTimeout(room.timer)
  rooms.delete(liveId)

  const redis = shared(liveId)
  if (redis) await redis.cache.del(redis.key).catch(() => null)
}
