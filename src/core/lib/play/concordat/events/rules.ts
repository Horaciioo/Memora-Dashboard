import { grossOf } from '@/core/lib/play/concordat/sim/economy'
import { modeRules } from '@/core/lib/play/concordat/modes/rules'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatPlayerState, ConcordatState } from '@/types/concordat'

/**
 * Shocks may strike this game
 * @param {ConcordatState} state - Game
 * @return {boolean} - On
 */

export const eventsOn = (state: ConcordatState): boolean =>
  Boolean(CONCORDAT.features.events) && Boolean(modeRules(state.mode).events)

/**
 * Living nations, the best first by a measure
 * @param {ConcordatState} state - Game
 * @param {(player: ConcordatPlayerState) => number} measure - Measure
 * @return {ConcordatPlayerState[]} - Ranked nations
 */

export const rankedBy = (
  state: ConcordatState,
  measure: (player: ConcordatPlayerState) => number
): ConcordatPlayerState[] =>
  state.players
    .filter((player) => player.alive)
    .sort((first, second) => measure(second) - measure(first) || first.id - second.id)

/**
 * Richest nations by earnings
 * @param {ConcordatState} state - Game
 * @return {ConcordatPlayerState[]} - Ranked nations
 */

export const richest = (state: ConcordatState): ConcordatPlayerState[] => rankedBy(state, grossOf)

/**
 * Largest nations by land
 * @param {ConcordatState} state - Game
 * @return {ConcordatPlayerState[]} - Ranked nations
 */

export const largest = (state: ConcordatState): ConcordatPlayerState[] =>
  rankedBy(state, (player) => player.tiles)
