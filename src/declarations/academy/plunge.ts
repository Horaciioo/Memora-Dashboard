import type { PlungeGesture } from '@/declarations/academy/curriculum/types'
import type { IconName } from '@/declarations/ui/icons'

/**
 * Gauge tuning of the opening scene
 * @type {Record<string, number>}
 */

export const PLUNGE_GAUGE = {
  warmthStart: 74,
  tensionStart: 10,
  // Chat cools when a harmless message is acted on
  coolDelete: 12,
  coolTimeout: 18,
  coolBan: 26,
  // Chat heats when a harmful message is left alone
  heat: 24,
  max: 100,
  // Misses that make a bet worth a remark
  missThreshold: 2,
} as const

/**
 * Gesture offered on a message
 * @typedef {Object} PlungeGestureOption
 * @property {string} label - Button text
 * @property {IconName} icon - Glyph
 */

interface PlungeGestureOption {
  label: string
  icon: IconName
}

/**
 * Gestures a moderator can play, the quietest first
 * @type {Record<PlungeGesture, PlungeGestureOption>}
 */

export const PLUNGE_GESTURES: Record<PlungeGesture, PlungeGestureOption> = {
  leave: { label: 'Laisser', icon: 'hidden' },
  delete: { label: 'Supprimer', icon: 'remove' },
  timeout: { label: 'Timeout 10 min', icon: 'clock' },
  ban: { label: 'Bannir', icon: 'blocked' },
}

/**
 * Gestures that act, in the order they are offered
 * @type {readonly PlungeGesture[]}
 */

export const PLUNGE_ACTIONS: readonly PlungeGesture[] = ['delete', 'timeout', 'ban']
