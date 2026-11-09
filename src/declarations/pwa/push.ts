import type { Tone } from '@/declarations/ui/theme'
import type { PushDeliveryStatusName } from '@/utils/constants/push'

/**
 * Hosts a browser subscription may point at, anything else is refused
 * @type {readonly string[]}
 */

export const PUSH_SERVICE_HOSTS: readonly string[] = [
  // Chrome, Edge on Android, Opera
  'fcm.googleapis.com',
  // Safari on iOS, iPadOS and macOS
  'push.apple.com',
  // Firefox
  'push.services.mozilla.com',
  // Edge on Windows
  'notify.windows.com',
]

/**
 * Longest values a subscription may carry
 * @type {{ endpoint: number, key: number }}
 */

export const PUSH_INPUT_LIMITS = { endpoint: 1024, key: 256 } as const

/**
 * Shape of a browser key, base64url
 * @type {RegExp}
 */

export const PUSH_KEY_PATTERN = /^[A-Za-z0-9_-]+=*$/

/**
 * Characters of a push topic
 * @type {number}
 */

export const PUSH_TOPIC_LENGTH = 32

/**
 * Browser key of a deliberate opt-out
 * @type {string}
 */

export const PUSH_OPT_OUT_KEY = 'memora:push-off'

/**
 * Query key of the journal page cursor
 * @type {string}
 */

export const PUSH_JOURNAL_CURSOR = 'apres'

/**
 * Colour of each journal outcome
 * @type {Record<PushDeliveryStatusName, Tone>}
 */

export const PUSH_STATUS_TONES: Record<PushDeliveryStatusName, Tone> = {
  Pending: 'neutral',
  Sent: 'success',
  Failed: 'danger',
  Expired: 'caution',
}
