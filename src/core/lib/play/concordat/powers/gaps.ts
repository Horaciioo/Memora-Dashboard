import { distanceBetween } from '@/core/lib/play/concordat/map/grid'

// Side of a bucket, in tiles
const CELL = 32

/**
 * Tiles kept apart by a minimum gap, looked up by buckets
 * @typedef {Object} ConcordatGaps
 */

export interface ConcordatGaps {
  add: (tile: number) => void
  isClear: (tile: number, gap: number) => boolean
}

/**
 * Empty gap index of a map
 * @param {number} width - Map width
 * @return {ConcordatGaps} - Index
 */

export const createGaps = (width: number): ConcordatGaps => {
  const buckets = new Map<number, number[]>()
  const columns = Math.ceil(width / CELL)
  const keyOf = (tile: number): number =>
    Math.floor(Math.floor(tile / width) / CELL) * columns + Math.floor((tile % width) / CELL)

  return {
    add: (tile) => {
      const key = keyOf(tile)
      const bucket = buckets.get(key)
      if (bucket) bucket.push(tile)
      else buckets.set(key, [tile])
    },
    isClear: (tile, gap) => {
      const reach = Math.ceil(gap / CELL)
      const column = Math.floor((tile % width) / CELL)
      const row = Math.floor(Math.floor(tile / width) / CELL)

      // Every bucket within reach
      for (let dy = -reach; dy <= reach; dy++) {
        for (let dx = -reach; dx <= reach; dx++) {
          const others = buckets.get((row + dy) * columns + column + dx)
          if (others?.some((other) => distanceBetween(other, tile, width) < gap)) return false
        }
      }

      return true
    },
  }
}
