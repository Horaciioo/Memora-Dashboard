import 'server-only'

import { LIVE_SETTINGS } from '@/declarations/configurations/settings'
import { LIVE_TOPICS } from '@/declarations/lives/topics'
import { runtime } from '@/managers/infrastructure/Core/runtime'
import type { ModViewConnection } from '@/types/modview'
import { HOUR_SECONDS } from '@/utils/constants/time'

// A live's memory outlives it this long at most
const RECENT_TTL_SECONDS = LIVE_SETTINGS.memoryHours * HOUR_SECONDS

// Survives dev hot reloads
const globalForRecent = globalThis as unknown as {
  liveRecent?: { connections: Map<string, LiveConnection> }
}

const memory = (globalForRecent.liveRecent ??= { connections: new Map() })

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
  memory.connections.delete(liveId)
}
