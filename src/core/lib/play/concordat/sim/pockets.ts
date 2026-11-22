import { neighborsOf, NEIGHBOR_SLOTS } from '@/core/lib/play/concordat/map'
import { eliminate } from '@/core/lib/play/concordat/sim/fall'
import { transferTile } from '@/core/lib/play/concordat/sim/tiles'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatState } from '@/types/concordat'
import { ConcordatTerrains } from '@/utils/constants/concordat'

const { sim } = CONCORDAT
const near = new Int32Array(NEIGHBOR_SLOTS)

/**
 * Land cut off from the rest of its nation and touched by a single other nation falls to it, like OpenFront. The sea is no way out, free land or a third power is
 * @param {ConcordatState} state - Game
 * @param {number} attacker - Nation around the piece
 * @param {number} defender - Nation holding the piece
 * @param {number} from - A tile of the defender next to the attacker
 * @param {Set<number>} spared - Tiles of pieces already checked this turn, filled here
 * @return {number} - Tiles taken, zero when the land is still joined to its nation
 */

export const claimPocket = (
  state: ConcordatState,
  attacker: number,
  defender: number,
  from: number,
  spared = new Set<number>()
): number => {
  if (state.owner[from] !== defender || spared.has(from)) return 0

  const { width, height } = state.map
  const seen = new Set<number>([from])
  const stack = [from]
  let touches = false
  while (stack.length) {
    const tile = stack.pop() as number
    const count = neighborsOf(tile, width, height, near)
    for (let slot = 0; slot < count; slot++) {
      const next = near[slot]
      const holder = state.owner[next]
      if (holder === attacker) touches = true
      if (holder === attacker || seen.has(next)) continue
      if (!holder && state.map.terrain[next] === ConcordatTerrains.Sea) continue

      // Free land or a third power leaves a way out
      if (holder !== defender) return markSpared(spared, seen, 0)

      seen.add(next)
      // Big enough to be the main body of the nation
      if (seen.size > sim.pocketMax) return markSpared(spared, seen, 0)
      stack.push(next)
    }
  }

  // Either a nation walled in whole or a piece smaller than the rest of it
  const defenderTiles = state.players[defender - 1].tiles
  const isMain = seen.size < defenderTiles && seen.size * 2 > defenderTiles
  if (!touches || isMain) return markSpared(spared, seen, 0)

  for (const tile of seen) transferTile(state, tile, attacker)

  return seen.size
}

// Remember a checked piece so its other tiles skip the walk
const markSpared = (spared: Set<number>, seen: Set<number>, taken: number): number => {
  for (const tile of seen) spared.add(tile)

  return taken
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
