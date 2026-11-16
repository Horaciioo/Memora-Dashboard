import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatState } from '@/types/concordat'

const { diplomacy } = CONCORDAT

/**
 * Move the public credit of a nation
 * @param {ConcordatState} state - Game
 * @param {number} playerId - Nation
 * @param {number} delta - Change, negative to lose
 * @return {void}
 */

export const adjustTrust = (state: ConcordatState, playerId: number, delta: number): void => {
  const next = Math.min(diplomacy.trustMax, Math.max(0, state.trust[playerId - 1] + delta))
  if (next === state.trust[playerId - 1]) return

  state.trust[playerId - 1] = next
  state.isSystemsDirty = true
}

/**
 * Credit so low that treaties with it may be broken freely
 * @param {ConcordatState} state - Game
 * @param {number} playerId - Nation
 * @return {boolean} - Condemned
 */

export const isCondemned = (state: ConcordatState, playerId: number): boolean =>
  state.trust[playerId - 1] < diplomacy.coalitionBelow
