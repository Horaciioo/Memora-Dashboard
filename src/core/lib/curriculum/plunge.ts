import { PLUNGE_GAUGE } from '@/declarations/academy/plunge'
import type {
  ChatLine,
  PlungeGesture,
  PlungeMessage,
} from '@/declarations/academy/curriculum/types'

/**
 * How one call compares with the team
 * @typedef {'fit' | 'too-much' | 'too-little' | 'defensible'} PlungeOutcome
 */

export type PlungeOutcome = 'fit' | 'too-much' | 'too-little' | 'defensible'

/**
 * Gesture played on each message, a missing one meaning it was left alone
 * @typedef {Record<string, PlungeGesture>} PlungeDecisions
 */

export type PlungeDecisions = Record<string, PlungeGesture>

/**
 * Compare a call with the team
 * @param {PlungeMessage} message - Message
 * @param {PlungeGesture} gesture - Gesture played
 * @return {PlungeOutcome} - Outcome
 */

export const outcomeOf = (message: PlungeMessage, gesture: PlungeGesture): PlungeOutcome => {
  if (message.verdict === 'split') return 'defensible'
  const acted = gesture !== 'leave'

  if (message.verdict === 'leave') return acted ? 'too-much' : 'fit'

  return acted ? 'fit' : 'too-little'
}

/**
 * Line a message shows, its text following what was done to the message it answers
 * @param {PlungeMessage} message - Message
 * @param {PlungeDecisions} decisions - Calls so far
 * @return {ChatLine} - Line as it arrives
 */

export const lineOf = (message: PlungeMessage, decisions: PlungeDecisions): ChatLine => {
  if (!message.reaction) return message.line

  return (decisions[message.reaction.after] ?? 'leave') !== 'leave'
    ? message.reaction.acted
    : message.reaction.left
}

/**
 * Chat mood after the calls made so far
 * @typedef {Object} PlungeGauges
 * @property {number} warmth - How alive the chat feels
 * @property {number} tension - How hot it runs
 */

export interface PlungeGauges {
  warmth: number
  tension: number
}

/**
 * Mood of the chat: acting on harmless messages cools it, leaving harmful ones heats it. The
 * last message on screen is not counted as left alone yet
 * @param {PlungeMessage[]} messages - Whole scene
 * @param {PlungeDecisions} decisions - Calls so far
 * @param {number} shown - Messages on screen
 * @return {PlungeGauges} - Gauges
 */

export const gaugesOf = (
  messages: PlungeMessage[],
  decisions: PlungeDecisions,
  shown: number
): PlungeGauges => {
  let warmth: number = PLUNGE_GAUGE.warmthStart
  let tension: number = PLUNGE_GAUGE.tensionStart

  messages.slice(0, shown).forEach((message, index) => {
    const gesture = decisions[message.key] ?? 'leave'
    const settled = index < shown - 1 || shown === messages.length

    // Harmless message acted on
    if (message.verdict === 'leave' && gesture !== 'leave') {
      warmth -=
        gesture === 'ban'
          ? PLUNGE_GAUGE.coolBan
          : gesture === 'timeout'
            ? PLUNGE_GAUGE.coolTimeout
            : PLUNGE_GAUGE.coolDelete
    }

    // Harmful message left alone
    if (message.verdict === 'act' && gesture === 'leave' && settled) {
      tension += PLUNGE_GAUGE.heat
      warmth -= PLUNGE_GAUGE.heat / 2
    }
  })

  const clamp = (value: number) => Math.min(PLUNGE_GAUGE.max, Math.max(0, value))

  return { warmth: clamp(warmth), tension: clamp(tension) }
}

/**
 * Calls that miss the team, in either direction
 * @param {PlungeMessage[]} messages - Whole scene
 * @param {PlungeDecisions} decisions - Calls made
 * @return {number} - Misses
 */

export const missesOf = (messages: PlungeMessage[], decisions: PlungeDecisions): number =>
  messages.filter((message) => {
    const outcome = outcomeOf(message, decisions[message.key] ?? 'leave')

    return outcome === 'too-much' || outcome === 'too-little'
  }).length
