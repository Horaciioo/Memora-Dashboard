import type { IntentGate } from '@/core/lib/modview/gate'
import type { ModViewIntent } from '@/types/modview'

/**
 * Gate check handed to every window
 * @typedef {(intent: ModViewIntent) => IntentGate} GateCheck
 */

export type GateCheck = (intent: ModViewIntent) => IntentGate

/**
 * Gesture runner handed to every window
 * @typedef {(intent: ModViewIntent) => void} ActRunner
 */

export type ActRunner = (intent: ModViewIntent) => void
