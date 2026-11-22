import { labelComponents } from '@/core/lib/play/concordat/map/grid'
import type { ConcordatMap } from '@/types/concordat'
import { ConcordatTerrains } from '@/utils/constants/concordat'

// Labels per map and side, dropped with the map
const cache = new WeakMap<ConcordatMap, { land?: Int32Array; sea?: Int32Array }>()

// Connected groups of one side of the shore, zero for the other side
const labelsOf = (map: ConcordatMap, side: 'land' | 'sea'): Int32Array => {
  const held = cache.get(map) ?? {}
  cache.set(map, held)
  if (held[side]) return held[side]

  const mask = map.terrain.map((value) =>
    (value === ConcordatTerrains.Sea) === (side === 'sea') ? 1 : 0
  )
  held[side] = labelComponents(mask, map.width, map.height).label

  return held[side]
}

/**
 * Landmass of every tile: land joined by land shares a label, water is zero
 * @param {ConcordatMap} map - Map
 * @return {Int32Array} - Label per tile
 */

export const landmassesOf = (map: ConcordatMap): Int32Array => labelsOf(map, 'land')

/**
 * Body of water of every tile: sea joined by sea shares a label, land is zero
 * @param {ConcordatMap} map - Map
 * @return {Int32Array} - Label per tile
 */

export const watersOf = (map: ConcordatMap): Int32Array => labelsOf(map, 'sea')

/**
 * Label the lands and the waters now, so no tick pays for it later
 * @param {ConcordatMap} map - Map
 * @return {void}
 */

export const warmRegions = (map: ConcordatMap): void => {
  landmassesOf(map)
  watersOf(map)
}
