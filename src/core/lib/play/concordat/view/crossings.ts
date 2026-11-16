import type { ConcordatMap } from '@/types/concordat'
import { ConcordatTerrains } from '@/utils/constants/concordat'

// Widest water a boat marks, and the spacing of two boats, in tiles
const CROSSING_WIDTH = 3
const CROSSING_GAP = 14

// Crossings per map, dropped with it
const cache = new WeakMap<ConcordatMap, number[]>()

// Middle tile of each narrow water run between two lands, along rows then columns
const scan = (map: ConcordatMap, vertical: boolean, found: Set<number>): void => {
  const { width, height, terrain } = map
  const lines = vertical ? width : height
  const length = vertical ? height : width
  const at = (line: number, step: number): number =>
    vertical ? step * width + line : line * width + step
  const isWater = (tile: number): boolean => terrain[tile] === ConcordatTerrains.Sea

  for (let line = 0; line < lines; line++) {
    let step = 1
    while (step < length - 1) {
      if (!isWater(at(line, step)) || isWater(at(line, step - 1))) {
        step++
        continue
      }
      let end = step
      while (end < length && isWater(at(line, end))) end++
      if (end < length && end - step <= CROSSING_WIDTH)
        found.add(at(line, step + ((end - step) >> 1)))
      step = end
    }
  }
}

/**
 * Narrow waters between two banks, where a boat is the only way over
 * @param {ConcordatMap} map - Map
 * @return {number[]} - Tiles, one per stretch of river
 */

export const crossingsOf = (map: ConcordatMap): number[] => {
  const known = cache.get(map)
  if (known) return known

  const found = new Set<number>()
  scan(map, false, found)
  scan(map, true, found)

  // One boat per cell so a river is not a string of them
  const taken = new Set<number>()
  const spread: number[] = []
  for (const tile of [...found].sort((a, b) => a - b)) {
    const key =
      Math.floor((tile % map.width) / CROSSING_GAP) +
      Math.floor(tile / map.width / CROSSING_GAP) * map.width
    if (taken.has(key)) continue
    taken.add(key)
    spread.push(tile)
  }
  cache.set(map, spread)

  return spread
}
