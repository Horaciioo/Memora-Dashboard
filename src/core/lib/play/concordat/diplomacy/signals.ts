import { tieKindOf } from '@/core/lib/play/concordat/diplomacy/ties'
import { ticksOf } from '@/core/lib/play/concordat/sim/tables'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatIntent, ConcordatState } from '@/types/concordat'
import { ConcordatTies } from '@/utils/constants/concordat'

const { diplomacy } = CONCORDAT

/**
 * Why a nation cannot be marked as the target, null when it can
 * @param {ConcordatState} state - Game
 * @param {Extract<ConcordatIntent, { kind: 'target' }>} intent - Order
 * @return {string | null} - Reason
 */

export const targetRefusal = (
  state: ConcordatState,
  intent: Extract<ConcordatIntent, { kind: 'target' }>
): string | null => {
  if (!CONCORDAT.features.diplomacy) return 'featureOff'
  if (intent.with === intent.playerId || !state.players[intent.with - 1]?.alive) return 'badTarget'
  if (tieKindOf(state, intent.playerId, intent.with) === ConcordatTies.Alliance) return 'friendly'

  const held = state.targets.find((mark) => mark.by === intent.playerId)

  return held && held.readyAt > state.tick ? 'cooldown' : null
}

/**
 * Mark a nation as the target of the marker and its allies for a few seconds
 * @param {ConcordatState} state - Game
 * @param {Extract<ConcordatIntent, { kind: 'target' }>} intent - Order
 * @return {void}
 */

export const markTarget = (
  state: ConcordatState,
  intent: Extract<ConcordatIntent, { kind: 'target' }>
): void => {
  state.targets = state.targets.filter((mark) => mark.by !== intent.playerId)
  state.targets.push({
    by: intent.playerId,
    target: intent.with,
    until: state.tick + ticksOf(diplomacy.targetSeconds),
    readyAt: state.tick + ticksOf(diplomacy.targetCooldownSeconds),
  })
  state.isSystemsDirty = true
}

/**
 * Why an emoji cannot go out, null when it can: a burst of five per window, no more
 * @param {ConcordatState} state - Game
 * @param {Extract<ConcordatIntent, { kind: 'emoji' }>} intent - Order
 * @return {string | null} - Reason
 */

export const emojiRefusal = (
  state: ConcordatState,
  intent: Extract<ConcordatIntent, { kind: 'emoji' }>
): string | null => {
  if (!CONCORDAT.features.diplomacy) return 'featureOff'
  if (intent.emoji >= diplomacy.emojiCount) return 'badRequest'
  if (intent.to === intent.playerId) return 'badTarget'
  if (intent.to && !state.players[intent.to - 1]?.alive) return 'badTarget'

  const burst = state.emojis.filter((item) => item.from === intent.playerId).length

  return burst >= diplomacy.emojiBurst ? 'tooFast' : null
}

/**
 * Throw an emoji, it lives a few seconds over the thrower
 * @param {ConcordatState} state - Game
 * @param {Extract<ConcordatIntent, { kind: 'emoji' }>} intent - Order
 * @return {void}
 */

export const sendEmoji = (
  state: ConcordatState,
  intent: Extract<ConcordatIntent, { kind: 'emoji' }>
): void => {
  state.emojis.push({
    from: intent.playerId,
    to: intent.to,
    emoji: intent.emoji,
    until: state.tick + ticksOf(diplomacy.emojiSeconds),
  })
  state.isSystemsDirty = true
}

/**
 * Drop the marks and emojis that ran out
 * @param {ConcordatState} state - Game
 * @return {void}
 */

export const runSignals = (state: ConcordatState): void => {
  if (state.tick % 5 !== 0 || (!state.targets.length && !state.emojis.length)) return

  const marks = state.targets.filter((mark) => mark.until > state.tick || mark.readyAt > state.tick)
  const emojis = state.emojis.filter((item) => item.until > state.tick)
  if (marks.length === state.targets.length && emojis.length === state.emojis.length) return

  state.targets = marks
  state.emojis = emojis
  state.isSystemsDirty = true
}
