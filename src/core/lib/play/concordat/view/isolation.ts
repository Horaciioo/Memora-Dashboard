import { neighborsOf, NEIGHBOR_SLOTS } from '@/core/lib/play/concordat/map'
import type { ConcordatMap } from '@/types/concordat'
import { ConcordatTerrains } from '@/utils/constants/concordat'

const near = new Int32Array(NEIGHBOR_SLOTS)

/**
 * A nation whose land touches no other land: only the sea leads on
 * @param {ConcordatMap} map - Map
 * @param {Uint8Array} owner - Owner of every tile
 * @param {number} me - Nation
 * @return {boolean} - True when nothing can be attacked by land
 */

export const isLandLocked = (map: ConcordatMap, owner: Uint8Array, me: number): boolean => {
  let isOwner = false

  for (let tile = 0; tile < owner.length; tile++) {
    if (owner[tile] !== me) continue

    isOwner = true
    const count = neighborsOf(tile, map.width, map.height, near)
    for (let slot = 0; slot < count; slot++) {
      const next = near[slot]
      if (owner[next] !== me && map.terrain[next] !== ConcordatTerrains.Sea) return false
    }
  }

  return isOwner
}
