import { neighborsOf, NEIGHBOR_SLOTS } from '@/core/lib/play/concordat/map'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatMap } from '@/types/concordat'
import { ConcordatTerrains } from '@/utils/constants/concordat'

const near = new Int32Array(NEIGHBOR_SLOTS)

/**
 * Sea tiles touching a land tile
 * @param {ConcordatMap} map - Map
 * @param {number} tile - Land tile
 * @return {number[]} - Sea tiles
 */

export const seaAround = (map: ConcordatMap, tile: number): number[] => {
  const count = neighborsOf(tile, map.width, map.height, near)
  const found: number[] = []
  for (let slot = 0; slot < count; slot++) {
    if (map.terrain[near[slot]] === ConcordatTerrains.Sea) found.push(near[slot])
  }

  return found
}

/**
 * Shortest way over water between two sets of sea tiles
 * @param {ConcordatMap} map - Map
 * @param {number[]} from - Start sea tiles
 * @param {number[]} to - Goal sea tiles
 * @return {number[] | null} - Tiles from a start to a goal, null when none is reachable
 */

export const seaPath = (map: ConcordatMap, from: number[], to: number[]): number[] | null => {
  if (!from.length || !to.length) return null

  const goals = new Set(to)
  const parent = new Int32Array(map.terrain.length).fill(-2)
  const queue = new Int32Array(map.terrain.length)
  let head = 0
  let tail = 0
  for (const start of from) {
    parent[start] = -1
    queue[tail++] = start
  }

  // Breadth first, bounded
  let reads = 0
  while (head < tail && reads++ < CONCORDAT.navy.pathLimit) {
    const tile = queue[head++]
    if (goals.has(tile)) return unwind(parent, tile)

    const count = neighborsOf(tile, map.width, map.height, near)
    for (let slot = 0; slot < count; slot++) {
      const next = near[slot]
      if (parent[next] !== -2 || map.terrain[next] !== ConcordatTerrains.Sea) continue
      parent[next] = tile
      queue[tail++] = next
    }
  }

  return null
}

// Tiles from the start to a goal
const unwind = (parent: Int32Array, goal: number): number[] => {
  const path: number[] = []
  for (let tile = goal; tile !== -1; tile = parent[tile]) path.push(tile)

  return path.reverse()
}
