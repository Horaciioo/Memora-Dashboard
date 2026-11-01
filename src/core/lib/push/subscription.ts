import { PUSH_INPUT_LIMITS, PUSH_KEY_PATTERN, PUSH_SERVICE_HOSTS } from '@/declarations/pwa/push'
import type { PushSubscriptionInput } from '@/types/push'

/**
 * Whether an address belongs to a known push service
 * @param {string} endpoint - Subscription address
 * @return {boolean} - Known service over HTTPS
 */

export const isPushServiceEndpoint = (endpoint: string): boolean => {
  if (endpoint.length > PUSH_INPUT_LIMITS.endpoint) return false

  try {
    const url = new URL(endpoint)

    // The server posts there, an unknown host would make it a relay
    return (
      url.protocol === 'https:' &&
      PUSH_SERVICE_HOSTS.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`))
    )
  } catch {
    return false
  }
}

// Browser key check
const isKey = (value: unknown): value is string =>
  typeof value === 'string' &&
  value.length > 0 &&
  value.length <= PUSH_INPUT_LIMITS.key &&
  PUSH_KEY_PATTERN.test(value)

/**
 * Read the subscription a browser sent
 * @param {Record<string, unknown>} raw - Request body
 * @return {PushSubscriptionInput | null} - Subscription or nothing when malformed
 */

export const readSubscriptionInput = (
  raw: Record<string, unknown>
): PushSubscriptionInput | null => {
  const { endpoint, p256dh, auth } = raw
  if (typeof endpoint !== 'string' || !isPushServiceEndpoint(endpoint)) return null
  if (!isKey(p256dh) || !isKey(auth)) return null

  return { endpoint, p256dh, auth }
}
