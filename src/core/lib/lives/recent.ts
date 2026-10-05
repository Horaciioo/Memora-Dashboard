import 'server-only'

import type { SceneEvent } from '@/core/lib/modview/scene'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'
import { LIVE_TOPICS } from '@/declarations/lives/topics'
import { runtime } from '@/managers/infrastructure/Core/runtime'
import type { ModViewConnection } from '@/types/modview'

// A live's memory outlives it by a day at most
const RECENT_TTL_SECONDS = 86400

// Survives dev hot reloads
const globalForRecent = globalThis as unknown as {
  liveRecent?: { events: Map<string, SceneEvent[]>; connections: Map<string, LiveConnection> }
}

const memory = (globalForRecent.liveRecent ??= { events: new Map(), connections: new Map() })

/**
 * Platform link of a live
 * @typedef {Object} LiveConnection
 * @property {ModViewConnection} state - Where it stands
 * @property {string | null} notice - Why
 */

export interface LiveConnection {
  state: ModViewConnection
  notice: string | null
}

/**
 * Redis client with its namespace
 * @return {{ cache: NonNullable<ReturnType<NonNullable<ReturnType<typeof runtime>>['redis']['cache']>>, prefix: string } | null} - Client
 */

const shared = () => {
  const container = runtime()
  const cache = container?.redis.isReady() ? container.redis.cache : null

  return cache ? { cache, prefix: container!.redis.prefix } : null
}

/**
 * Keep one Mod View event of a live
 * @param {string} liveId - Live
 * @param {SceneEvent} event - Event
 * @return {Promise<void>} - Kept
 */

export const keepRecentEvent = async (liveId: string, event: SceneEvent): Promise<void> => {
  const redis = shared()
  if (redis) {
    const key = `${redis.prefix}${LIVE_TOPICS.recent(liveId)}`
    await redis.cache.rpush(key, JSON.stringify(event))
    await redis.cache.ltrim(key, -LIVE_SETTINGS.recentEvents, -1)
    await redis.cache.expire(key, RECENT_TTL_SECONDS)
    return
  }

  const list = memory.events.get(liveId) ?? []
  list.push(event)
  memory.events.set(liveId, list.slice(-LIVE_SETTINGS.recentEvents))
}

/**
 * Recent Mod View events of a live
 * @param {string} liveId - Live
 * @return {Promise<SceneEvent[]>} - Events
 */

export const readRecentEvents = async (liveId: string): Promise<SceneEvent[]> => {
  const redis = shared()
  if (!redis) return memory.events.get(liveId) ?? []

  const rows = await redis.cache.lrange(`${redis.prefix}${LIVE_TOPICS.recent(liveId)}`, 0, -1)

  return rows.flatMap((row) => {
    try {
      return [JSON.parse(row) as SceneEvent]
    } catch {
      return []
    }
  })
}

/**
 * Remember the platform link of a live
 * @param {string} liveId - Live
 * @param {LiveConnection} connection - Link
 * @return {Promise<void>} - Kept
 */

export const keepConnection = async (liveId: string, connection: LiveConnection): Promise<void> => {
  const redis = shared()
  if (redis) {
    await redis.cache.set(
      `${redis.prefix}${LIVE_TOPICS.connection(liveId)}`,
      JSON.stringify(connection),
      'EX',
      RECENT_TTL_SECONDS
    )
    return
  }

  memory.connections.set(liveId, connection)
}

/**
 * Platform link of a live
 * @param {string} liveId - Live
 * @return {Promise<LiveConnection | null>} - Link
 */

export const readConnection = async (liveId: string): Promise<LiveConnection | null> => {
  const redis = shared()
  if (!redis) return memory.connections.get(liveId) ?? null

  const raw = await redis.cache.get(`${redis.prefix}${LIVE_TOPICS.connection(liveId)}`)

  return raw ? (JSON.parse(raw) as LiveConnection) : null
}

/**
 * Forget a closed live
 * @param {string} liveId - Live
 * @return {Promise<void>} - Forgotten
 */

export const forgetLive = async (liveId: string): Promise<void> => {
  memory.events.delete(liveId)
  memory.connections.delete(liveId)
}
