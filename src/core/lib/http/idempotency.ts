import 'server-only'

import { conflict } from '@/core/lib/errors'
import { ASSISTANT_SETTINGS } from '@/declarations/assistant/settings'
import { IDEMPOTENCY_HEADER } from '@/declarations/system/security/idempotency'
import { runtime } from '@/managers/infrastructure/Core/runtime'

// Pending or settled answer
type Entry = { state: 'pending' } | { state: 'done'; data: unknown }

// Survives dev hot reloads
const globalForReplies = globalThis as unknown as {
  idempotentReplies?: Map<string, { entry: Entry; expiresAt: number }>
}

const local = (globalForReplies.idempotentReplies ??= new Map())

// Longest accepted key
const KEY_MAX_LENGTH = 128

const ttlSeconds = () => ASSISTANT_SETTINGS.idempotencyMinutes * 60

// Shared store when Redis is up
const sharedStore = () => {
  const container = runtime()
  const cache = container?.redis.isReady() ? container.redis.cache : null

  return cache ? { cache, prefix: `${container!.redis.prefix}idempotency:` } : null
}

/**
 * Claim a key or read its answer
 * @param {string} key - Scoped key
 * @return {Promise<Entry | null>} - Stored entry or fresh claim
 */

const claim = async (key: string): Promise<Entry | null> => {
  const pending = JSON.stringify({ state: 'pending' } satisfies Entry)
  const shared = sharedStore()

  if (shared) {
    const taken = await shared.cache.set(shared.prefix + key, pending, 'EX', ttlSeconds(), 'NX')
    if (taken === 'OK') return null

    const stored = await shared.cache.get(shared.prefix + key)
    return stored ? (JSON.parse(stored) as Entry) : { state: 'pending' }
  }

  // Expired keys drop on read
  const now = Date.now()
  for (const [stored, slot] of local) if (slot.expiresAt < now) local.delete(stored)

  const slot = local.get(key)
  if (slot) return slot.entry

  local.set(key, { entry: { state: 'pending' }, expiresAt: now + ttlSeconds() * 1000 })

  return null
}

// Keep the answer for replays
const settle = async (key: string, entry: Entry | null): Promise<void> => {
  const shared = sharedStore()

  if (shared) {
    if (entry)
      await shared.cache.set(shared.prefix + key, JSON.stringify(entry), 'EX', ttlSeconds())
    else await shared.cache.del(shared.prefix + key)
    return
  }

  if (entry) local.set(key, { entry, expiresAt: Date.now() + ttlSeconds() * 1000 })
  else local.delete(key)
}

/**
 * Run a write once per key
 * @param {Object} input - Request facts
 * @param {Headers} input.headers - Request headers
 * @param {string} input.scope - Actor and path
 * @param {() => Promise<T>} input.run - Write to guard
 * @return {Promise<T>} - First answer, replayed
 */

export const runOnce = async <T>({
  headers,
  scope,
  run,
}: {
  headers: Headers
  scope: string
  run: () => Promise<T>
}): Promise<T> => {
  const raw = headers.get(IDEMPOTENCY_HEADER)?.trim()
  if (!raw || raw.length > KEY_MAX_LENGTH) return run()

  const key = `${scope}:${raw}`
  const stored = await claim(key)

  // A retry gets the first answer
  if (stored?.state === 'done') return stored.data as T
  if (stored) throw conflict()

  try {
    const data = await run()
    await settle(key, { state: 'done', data })
    return data
  } catch (error) {
    // A failure may be tried again
    await settle(key, null)
    throw error
  }
}
