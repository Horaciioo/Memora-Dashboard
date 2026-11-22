import type { ConcordatState } from '@/types/concordat'
import { ConcordatTerrains } from '@/utils/constants/concordat'

// Land tiles of a map, counted once
const landTotals = new WeakMap<ConcordatState['map'], number>()

/**
 * Land tiles of the map
 * @param {ConcordatState} state - Game
 * @return {number} - Count
 */

export const landOf = (state: ConcordatState): number => {
  const known = landTotals.get(state.map)
  if (known !== undefined) return known

  // Plain loop, a reduce over millions of tiles costs tens of ms
  const { terrain } = state.map
  let total = 0
  for (let index = 0; index < terrain.length; index++)
    if (terrain[index] !== ConcordatTerrains.Sea) total++
  landTotals.set(state.map, total)

  return total
}
