import { SECOND_MS } from '@/utils/constants/time'

/**
 * Fields that tell whether two log lines are the same gesture
 * @typedef {Object} GestureKey
 */

export interface GestureKey {
  kind: string
  actorPlatformUserId: string | null
  targetPlatformUserId: string | null
  occurredAt: Date
}

// Seconds a Memora gesture and its platform echo may arrive apart
export const ECHO_WINDOW_SECONDS = 90

// Kinds whose Memora side never knows the viewer, the held message or request names it
const BLIND_TARGET_KINDS = new Set([
  'AUTOMOD_APPROVE',
  'AUTOMOD_DENY',
  'UNBAN_REQUEST_APPROVE',
  'UNBAN_REQUEST_DENY',
])

/**
 * Whether a Memora line and a platform line are one gesture, whichever came first
 * @param {GestureKey} memora - Line written from Memora
 * @param {GestureKey} platform - Line the platform reported
 * @param {number} [windowSeconds] - Longest gap
 * @return {boolean} - Same gesture
 */

export const isSameGesture = (
  memora: GestureKey,
  platform: GestureKey,
  windowSeconds = ECHO_WINDOW_SECONDS
): boolean => {
  if (memora.kind !== platform.kind) return false
  if (memora.actorPlatformUserId !== platform.actorPlatformUserId) return false
  if (
    Math.abs(memora.occurredAt.getTime() - platform.occurredAt.getTime()) >
    windowSeconds * SECOND_MS
  ) {
    return false
  }
  // The viewer, unless the Memora side could not name it
  const blind = memora.targetPlatformUserId === null && BLIND_TARGET_KINDS.has(memora.kind)

  return blind || memora.targetPlatformUserId === platform.targetPlatformUserId
}
