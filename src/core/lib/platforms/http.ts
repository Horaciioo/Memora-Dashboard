import { TIMEOUT_SETTINGS } from '@/declarations/configurations/settings'

/**
 * Failure answered by a platform
 * @typedef {Object} PlatformError
 * @property {number} status - HTTP status, 0 when unreachable
 * @property {string} detail - Platform message, never shown raw
 */

export class PlatformError extends Error {
  readonly status: number
  readonly detail: string

  constructor(status: number, detail: string) {
    super(`platform answered ${status}`)
    this.name = 'PlatformError'
    this.status = status
    this.detail = detail
  }
}

/**
 * Points left on one token, read from the rate limit headers
 * @typedef {Object} RateBucket
 * @property {number} remaining - Points left
 * @property {number} resetAt - When the bucket refills, epoch ms
 */

interface RateBucket {
  remaining: number
  resetAt: number
}

// Buckets per token key, shared by every call of the process
const buckets = new Map<string, RateBucket>()

// Retries after a server failure
const MAX_RETRIES = 2

// First retry delay, doubled each time
const BACKOFF_MS = 400

// Longest wait for a refill before giving up
const MAX_REFILL_WAIT_MS = 15000

/**
 * One call to a platform
 * @typedef {Object} PlatformRequest
 * @property {string} url - Absolute URL
 * @property {'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'} [method] - Verb
 * @property {Record<string, string>} headers - Authorization and client headers
 * @property {unknown} [body] - JSON body
 * @property {string} bucket - Rate limit key, one per token
 */

export interface PlatformRequest {
  url: string
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  headers: Record<string, string>
  body?: unknown
  bucket: string
}

// Pause helper
const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Remember what the platform says is left
 * @param {string} key - Bucket key
 * @param {Headers} headers - Response headers
 * @return {void}
 */

const readBucket = (key: string, headers: Headers): void => {
  const remaining = Number(headers.get('ratelimit-remaining'))
  const reset = Number(headers.get('ratelimit-reset'))
  if (!Number.isFinite(remaining) || !Number.isFinite(reset) || reset === 0) return

  buckets.set(key, { remaining, resetAt: reset * 1000 })
}

/**
 * Wait for a refill when the bucket is empty
 * @param {string} key - Bucket key
 * @return {Promise<void>} - Ready
 */

const awaitRefill = async (key: string): Promise<void> => {
  const bucket = buckets.get(key)
  if (!bucket || bucket.remaining > 0) return

  const delay = bucket.resetAt - Date.now()
  if (delay <= 0) return
  if (delay > MAX_REFILL_WAIT_MS) throw new PlatformError(429, 'rate limited')

  await wait(delay)
}

/**
 * Call a platform: timeout, retry on server failure, wait on the rate limit
 * @param {PlatformRequest} request - Call
 * @return {Promise<T | null>} - JSON answer, null when empty
 */

export const platformRequest = async <T>(request: PlatformRequest): Promise<T | null> => {
  for (let attempt = 0; ; attempt += 1) {
    await awaitRefill(request.bucket)

    let response: Response
    try {
      response = await fetch(request.url, {
        method: request.method ?? 'GET',
        signal: AbortSignal.timeout(TIMEOUT_SETTINGS.externalMs),
        headers: {
          ...request.headers,
          ...(request.body === undefined ? {} : { 'content-type': 'application/json' }),
        },
        body: request.body === undefined ? undefined : JSON.stringify(request.body),
      })
    } catch (error) {
      // Unreachable, retried like a server failure
      if (attempt < MAX_RETRIES) {
        await wait(BACKOFF_MS * 2 ** attempt)
        continue
      }
      throw new PlatformError(0, error instanceof Error ? error.message : 'unreachable')
    }

    readBucket(request.bucket, response.headers)

    // Rate limited: wait for the refill once, then give up
    if (response.status === 429 && attempt < MAX_RETRIES) {
      buckets.set(request.bucket, {
        remaining: 0,
        resetAt: Number(response.headers.get('ratelimit-reset')) * 1000 || Date.now() + BACKOFF_MS,
      })
      continue
    }

    // Server failure, retried with backoff
    if (response.status >= 500 && attempt < MAX_RETRIES) {
      await wait(BACKOFF_MS * 2 ** attempt)
      continue
    }

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null
      throw new PlatformError(response.status, payload?.message ?? response.statusText)
    }

    if (response.status === 204) return null
    const text = await response.text()

    return text.length > 0 ? (JSON.parse(text) as T) : null
  }
}

/**
 * Forget every bucket, for tests
 * @return {void}
 */

export const resetPlatformBuckets = (): void => buckets.clear()
