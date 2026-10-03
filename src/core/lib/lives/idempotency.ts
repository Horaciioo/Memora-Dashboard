import 'server-only'

import { LIVE_SETTINGS } from '@/declarations/configurations/settings'
import { runtime } from '@/managers/infrastructure/Core/runtime'

// Survives dev hot reloads, keys and their expiry
const globalForKeys = globalThis as unknown as { liveActKeys?: Map<string, number> }

const keys = (globalForKeys.liveActKeys ??= new Map())

/**
 * Claim a gesture key once: a double click finds it taken
 * @param {string} key - Gesture key
 * @return {Promise<boolean>} - First claim
 */

export const claimGestureKey = async (key: string): Promise<boolean> => {
  const ttlSeconds = LIVE_SETTINGS.idempotencyMinutes * 60
  const container = runtime()
  const cache = container?.redis.isReady() ? container.redis.cache : null

  if (cache) {
    const claimed = await cache.set(
      `${container!.redis.prefix}gesture:${key}`,
      '1',
      'EX',
      ttlSeconds,
      'NX'
    )

    return claimed === 'OK'
  }

  // Expired keys dropped as the map is read
  const now = Date.now()
  for (const [stored, expiresAt] of keys) if (expiresAt < now) keys.delete(stored)
  if (keys.has(key)) return false

  keys.set(key, now + ttlSeconds * 1000)

  return true
}
