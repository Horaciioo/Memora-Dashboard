import type { IntentGate } from '@/core/lib/modview/gate'
import type { ActContext, ModViewIntent } from '@/types/modview'

/**
 * Gate check handed to every window
 * @typedef {(intent: ModViewIntent) => IntentGate} GateCheck
 */

export type GateCheck = (intent: ModViewIntent) => IntentGate

/**
 * Gesture runner handed to every window
 * @typedef {(intent: ModViewIntent, context?: ActContext) => void} ActRunner
 */

export type ActRunner = (intent: ModViewIntent, context?: ActContext) => void
