import { RATE_LIMIT_REGISTRY, RATE_LIMIT_SCOPES } from '@/declarations/system/rateLimits'
import type { RateLimitName, RateLimitPolicy } from '@/declarations/system/rateLimits'

/**
 * Outcome of one attempt
 * @typedef {Object} RateLimitVerdict
 * @property {boolean} allowed - Attempt fits the window
 * @property {number} remaining - Attempts still available
 * @property {number} retryAfterSeconds - Wait before retrying
 */

export interface RateLimitVerdict {
  allowed: boolean
  remaining: number
  retryAfterSeconds: number
}

/**
 * Counter backing the limiter
 * @typedef {Object} RateLimitStore
 * @property {(key: string, windowSeconds: number) => Promise<number>} hit - Count one attempt
 */

export interface RateLimitStore {
  hit: (key: string, windowSeconds: number) => Promise<number>
}

interface MemoryWindow {
  count: number
  expiresAt: number
}

const windows = new Map<string, MemoryWindow>()

// Sweeps at most once per this many hits
const SWEEP_EVERY = 500

let hitsSinceSweep = 0

/**
 * Drop expired windows
 * @param {number} now - Epoch ms
 * @return {void}
 */

const sweep = (now: number): void => {
  for (const [key, window] of windows) {
    if (window.expiresAt <= now) windows.delete(key)
  }
}

// Single process fallback, correct until a second instance exists
const memoryStore: RateLimitStore = {
  hit: async (key, windowSeconds) => {
    const now = Date.now()

    // Amortised cleanup, no timer to unref
    hitsSinceSweep += 1
    if (hitsSinceSweep >= SWEEP_EVERY) {
      hitsSinceSweep = 0
      sweep(now)
    }

    const current = windows.get(key)
    if (!current || current.expiresAt <= now) {
      windows.set(key, { count: 1, expiresAt: now + windowSeconds * 1000 })

      return 1
    }

    current.count += 1

    return current.count
  },
}

let bound: RateLimitStore = memoryStore

/**
 * Swap the counter for a shared one
 * @param {RateLimitStore} store - Replacement store
 * @return {void}
 */

export const bindRateLimitStore = (store: RateLimitStore): void => {
  bound = store
}

/**
 * Restore the in-process counter
 * @return {void}
 */

export const unbindRateLimitStore = (): void => {
  bound = memoryStore
  windows.clear()
}

/**
 * Build the counter key of one attempt
 * @param {RateLimitName} name - Policy name
 * @param {string} identity - Address or account
 * @return {string} - Counter key
 */

const keyOf = (name: RateLimitName, identity: string): string => `rate:${name}:${identity}`

/**
 * Count one attempt against a policy
 * @param {RateLimitName} name - Policy name
 * @param {string} identity - Address or account
 * @return {Promise<RateLimitVerdict>} - Verdict
 */

export const consume = async (name: RateLimitName, identity: string): Promise<RateLimitVerdict> => {
  const policy: RateLimitPolicy = RATE_LIMIT_REGISTRY.get(name)

  // A missing identity would share one counter between everyone
  if (identity.length === 0) {
    return { allowed: true, remaining: policy.max, retryAfterSeconds: 0 }
  }

  const count = await bound.hit(keyOf(name, identity), policy.windowSeconds)

  return {
    allowed: count <= policy.max,
    remaining: Math.max(0, policy.max - count),
    retryAfterSeconds: count <= policy.max ? 0 : policy.windowSeconds,
  }
}

// Headers a proxy sets, ordered from most to least trustworthy
const ADDRESS_HEADERS = ['x-real-ip', 'cf-connecting-ip', 'x-forwarded-for'] as const

/**
 * Read the caller address behind a proxy
 * @param {Headers} headers - Request headers
 * @return {string} - Client address
 */

export const readAddress = (headers: Headers): string => {
  for (const header of ADDRESS_HEADERS) {
    const value = headers.get(header)
    if (!value) continue

    // A forwarded chain names the client first
    const first = value.split(',')[0]?.trim()
    if (first) return first
  }

  return ''
}

/**
 * Resolve what a policy counts against
 * @param {RateLimitName} name - Policy name
 * @param {Headers} headers - Request headers
 * @param {string} [accountId] - Signed-in member
 * @return {string} - Counted identity
 */

export const readIdentity = (name: RateLimitName, headers: Headers, accountId?: string): string => {
  const { scope } = RATE_LIMIT_REGISTRY.get(name)

  // An account policy falls back to the address before a session exists
  if (scope === RATE_LIMIT_SCOPES.Account && accountId) return accountId

  return readAddress(headers)
}
