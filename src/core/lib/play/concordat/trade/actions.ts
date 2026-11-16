import { adjustTrust, isCondemned } from '@/core/lib/play/concordat/diplomacy/trust'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatState } from '@/types/concordat'

/**
 * Close every route with a partner, closing costs a little credit
 * @param {ConcordatState} state - Game
 * @param {number} playerId - Closing nation
 * @param {number} other - Partner
 * @return {boolean} - Something closed
 */

export const closeTrade = (state: ConcordatState, playerId: number, other: number): boolean => {
  const kept = state.routes.filter(
    (route) =>
      !((route.a === playerId && route.b === other) || (route.a === other && route.b === playerId))
  )
  if (kept.length === state.routes.length) return false

  state.routes = kept
  state.isSystemsDirty = true
  if (!isCondemned(state, other)) adjustTrust(state, playerId, -CONCORDAT.trade.closeTrust)

  return true
}
