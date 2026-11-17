import { neighborsOf, NEIGHBOR_SLOTS } from '@/core/lib/play/concordat/map'
import { eliminate } from '@/core/lib/play/concordat/sim/fall'
import { transferTile } from '@/core/lib/play/concordat/sim/tiles'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatState } from '@/types/concordat'

const { sim } = CONCORDAT
const near = new Int32Array(NEIGHBOR_SLOTS)

/**
 * A pocket of land wholly walled in by one attacker falls to it without a fight, coast and other powers break the wall
 * @param {ConcordatState} state - Game
 * @param {number} attacker - Nation around the pocket
 * @param {number} defender - Nation holding the pocket
 * @param {number} from - A tile of the defender next to the attacker
 * @return {number} - Tiles taken, zero when the land is not walled in
 */

export const claimPocket = (
  state: ConcordatState,
  attacker: number,
  defender: number,
  from: number
): number => {
  if (state.owner[from] !== defender) return 0

  const { width, height } = state.map
  const seen = new Set<number>([from])
  const stack = [from]
  while (stack.length) {
    const tile = stack.pop() as number
    const count = neighborsOf(tile, width, height, near)
    for (let slot = 0; slot < count; slot++) {
      const next = near[slot]
      const holder = state.owner[next]
      if (holder === attacker || seen.has(next)) continue
      // Any other holder, free land or sea leaves a way out
      if (holder !== defender) return 0

      seen.add(next)
      if (seen.size > sim.pocketMax) return 0
      stack.push(next)
    }
  }
  for (const tile of seen) transferTile(state, tile, attacker)

  return seen.size
}

/**
 * A nation too small to hold falls whole to the one that broke it
 * @param {ConcordatState} state - Game
 * @param {number} attacker - Nation that took the last tile
 * @param {number} defender - Nation falling
 * @return {void}
 */

export const collapseNation = (state: ConcordatState, attacker: number, defender: number): void => {
  const fallen = state.players[defender - 1]
  if (fallen.tiles > 0) {
    for (let tile = 0; tile < state.owner.length; tile++) {
      if (state.owner[tile] === defender) transferTile(state, tile, attacker)
    }
  }
  eliminate(state, fallen, attacker)
}
