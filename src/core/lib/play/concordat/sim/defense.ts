import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatState } from '@/types/concordat'

const { sim } = CONCORDAT

/**
 * Troops per border tile of a defender, a long front is thin
 * @param {ConcordatState} state - Game
 * @param {number} attacker - Attacking player
 * @param {number} defender - Defending player, zero for free land
 * @return {number} - Defense density
 */

export const defenseDensity = (
  state: ConcordatState,
  attacker: number,
  defender: number
): number => {
  if (!defender) return sim.neutralDensity

  const target = state.players[defender - 1]
  const density = target.troops / Math.max(1, target.front.size)

  // The small neighbour of a giant resists
  const giant = state.players[attacker - 1]
  const resists = giant.tiles >= sim.resistanceRatio * target.tiles

  return resists ? density * (1 + sim.resistanceBonus) : density
}
