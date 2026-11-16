import { neighborsOf, NEIGHBOR_SLOTS } from '@/core/lib/play/concordat/map'
import type { ConcordatState } from '@/types/concordat'
import { ConcordatTerrains } from '@/utils/constants/concordat'

const near = new Int32Array(NEIGHBOR_SLOTS)

/**
 * A tile of the zone to attack next: the one already most held, else the first met
 * @param {ConcordatState} state - Game
 * @param {number} playerId - Attacker
 * @param {number} target - Holder of the land, zero for free land
 * @return {number} - Tile in the zone, -1 when no zone touches
 */

export const zoneTileOf = (state: ConcordatState, playerId: number, target: number): number => {
  const { width, height, terrain, province, provinces } = state.map
  const stride = provinces.length + 1
  let best = -1
  let bestShare = -1

  for (const edge of state.players[playerId - 1].front) {
    const count = neighborsOf(edge, width, height, near)
    for (let slot = 0; slot < count; slot++) {
      const next = near[slot]
      const id = province[next]
      if (!id || state.owner[next] !== target || terrain[next] === ConcordatTerrains.Sea) continue

      // Finish a zone already begun before opening another
      const share = state.provinceCounts[playerId * stride + id] / provinces[id - 1].tiles
      if (share > bestShare) {
        bestShare = share
        best = next
      }
    }
  }

  return best
}

/**
 * Nation already pushing on this target, so its zone is not done
 * @param {ConcordatState} state - Game
 * @param {number} playerId - Attacker
 * @param {number} target - Holder of the land
 * @return {boolean} - Push under way
 */

export const isPushing = (state: ConcordatState, playerId: number, target: number): boolean =>
  state.corps.some((corps) => corps.owner === playerId && corps.target === target && !corps.feint)
