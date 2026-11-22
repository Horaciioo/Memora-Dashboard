import { neighborsOf, NEIGHBOR_SLOTS, watersOf } from '@/core/lib/play/concordat/map'
import { popTile, pushTile } from '@/core/lib/play/concordat/navy/heap'
import type { TileHeap } from '@/core/lib/play/concordat/navy/heap'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatMap } from '@/types/concordat'
import { ConcordatTerrains } from '@/utils/constants/concordat'

const { navy } = CONCORDAT
const near = new Int32Array(NEIGHBOR_SLOTS)

// Search costs in tenths of a tile, a diagonal is about 1.4 straight steps
const STRAIGHT_COST = 10
const DIAGONAL_COST = 14
const STEPS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
  [-1, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
]

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
 * Land tiles of one holder that touch the sea, nearest to a tile first, the walk never leaves the holder
 * @param {ConcordatMap} map - Map
 * @param {Uint8Array} owner - Holder of every tile
 * @param {number} tile - Land tile to start from
 * @return {number[]} - Shore tiles, the tile itself first when it is one
 */

export const shoresNear = (map: ConcordatMap, owner: Uint8Array, tile: number): number[] => {
  const holder = owner[tile]
  const seen = new Set<number>([tile])
  const queue = [tile]
  const shores: number[] = []

  // Breadth first over land, bounded
  for (
    let head = 0;
    head < queue.length && queue.length < navy.shoreSteps && shores.length < navy.shoreCandidates;
    head++
  ) {
    const current = queue[head]
    const count = neighborsOf(current, map.width, map.height, near)
    let isShore = false
    for (let slot = 0; slot < count; slot++) {
      const next = near[slot]
      if (map.terrain[next] === ConcordatTerrains.Sea) isShore = true
      else if (!seen.has(next) && owner[next] === holder) {
        seen.add(next)
        queue.push(next)
      }
    }
    if (isShore) shores.push(current)
  }

  return shores
}

// Search memory shared by every search of a map size: a round number tells fresh cells from stale ones
const scratch = {
  round: 0,
  seen: new Uint32Array(0),
  done: new Uint32Array(0),
  cost: new Int32Array(0),
  parent: new Int32Array(0),
}
const heap: TileHeap = { tiles: [], scores: [] }

// Tiles from the start to a goal
const unwind = (goal: number): number[] => {
  const path: number[] = []
  for (let tile = goal; tile !== -1; tile = scratch.parent[tile]) path.push(tile)

  return path.reverse()
}

// Straight run of sea tiles between two tiles, null when land or a pinched corner is in the way
const straightRun = (map: ConcordatMap, from: number, to: number): number[] | null => {
  const { width, terrain } = map
  let x = from % width
  let y = (from - x) / width
  const endX = to % width
  const endY = Math.floor(to / width)
  const stepX = Math.sign(endX - x)
  const stepY = Math.sign(endY - y)
  const spanX = Math.abs(endX - x)
  const spanY = Math.abs(endY - y)
  const run = [from]
  let error = spanX - spanY

  while (x !== endX || y !== endY) {
    const doubled = error * 2
    const moveX = doubled > -spanY
    const moveY = doubled < spanX
    if (moveX) {
      error -= spanY
      x += stepX
    }
    if (moveY) {
      error += spanX
      y += stepY
    }

    // A diagonal step may not squeeze between two land corners
    const tile = y * width + x
    if (terrain[tile] !== ConcordatTerrains.Sea) return null
    if (moveX && moveY) {
      if (terrain[tile - stepX] !== ConcordatTerrains.Sea) return null
      if (terrain[tile - stepY * width] !== ConcordatTerrains.Sea) return null
    }
    run.push(tile)
  }

  return run
}

// Pulls a stepped path taut: longest straight runs, so a boat sails lines, not staircases
const straighten = (map: ConcordatMap, path: number[]): number[] => {
  const result = [path[0]]
  let anchor = 0

  while (anchor < path.length - 1) {
    let best = anchor + 1
    let bestRun: number[] = [path[anchor], path[best]]
    for (let reach = anchor + 2; reach < path.length; reach++) {
      const run = straightRun(map, path[anchor], path[reach])
      if (!run) break
      best = reach
      bestRun = run
    }
    for (let index = 1; index < bestRun.length; index++) result.push(bestRun[index])
    anchor = best
  }

  return result
}

/**
 * Shortest way over water between two sets of sea tiles, A* so a crossing of the whole map stays cheap
 * @param {ConcordatMap} map - Map
 * @param {number[]} from - Start sea tiles
 * @param {number[]} to - Goal sea tiles
 * @param {number} [limit] - Tiles the search may read, a landing may cross the map, a trade run stays near
 * @return {number[] | null} - Tiles from a start to a goal, null when none is reachable
 */

export const seaPath = (
  map: ConcordatMap,
  from: number[],
  to: number[],
  limit = navy.pathLimit
): number[] | null => {
  if (!from.length || !to.length) return null

  // Goals on a body of water no start touches can never be reached, no need to search
  const { width, height, terrain } = map
  const waters = watersOf(map)
  const reached = new Set(from.map((start) => waters[start]))
  const goals = new Set(to.filter((goal) => reached.has(waters[goal])))
  if (!goals.size) return null

  // A few goals steer the search, a long list is sampled
  const stride = Math.max(1, Math.ceil(goals.size / navy.aimGoals))
  const aims = [...goals].filter((_, index) => index % stride === 0)
  const aimX = aims.map((aim) => aim % width)
  const aimY = aims.map((aim) => Math.floor(aim / width))
  const heuristic = (tile: number): number => {
    const x = tile % width
    const y = (tile - x) / width
    let best = Infinity
    for (let index = 0; index < aims.length; index++) {
      best = Math.min(best, (x - aimX[index]) ** 2 + (y - aimY[index]) ** 2)
    }

    return Math.sqrt(best) * STRAIGHT_COST
  }

  if (scratch.seen.length !== terrain.length) {
    scratch.seen = new Uint32Array(terrain.length)
    scratch.done = new Uint32Array(terrain.length)
    scratch.cost = new Int32Array(terrain.length)
    scratch.parent = new Int32Array(terrain.length)
    scratch.round = 0
  }
  const round = ++scratch.round
  const { seen, done, cost, parent } = scratch
  heap.tiles.length = 0
  heap.scores.length = 0
  for (const start of from) {
    seen[start] = round
    cost[start] = 0
    parent[start] = -1
    pushTile(heap, start, heuristic(start))
  }

  // Cheapest guess first, bounded
  for (let reads = 0; heap.tiles.length && reads < limit; reads++) {
    const tile = popTile(heap)
    if (goals.has(tile)) return straighten(map, unwind(tile))
    if (done[tile] === round) continue

    done[tile] = round
    const tileX = tile % width
    const tileY = (tile - tileX) / width

    // Eight directions, a diagonal costs more and never cuts a land corner
    for (let slot = 0; slot < STEPS.length; slot++) {
      const [moveX, moveY] = STEPS[slot]
      const nextX = tileX + moveX
      const nextY = tileY + moveY
      if (nextX < 0 || nextY < 0 || nextX >= width || nextY >= height) continue

      const next = nextY * width + nextX
      if (terrain[next] !== ConcordatTerrains.Sea) continue
      const isDiagonal = moveX !== 0 && moveY !== 0
      if (
        isDiagonal &&
        (terrain[tile + moveX] !== ConcordatTerrains.Sea ||
          terrain[tile + moveY * width] !== ConcordatTerrains.Sea)
      )
        continue

      const spent = cost[tile] + (isDiagonal ? DIAGONAL_COST : STRAIGHT_COST)
      if (seen[next] === round && spent >= cost[next]) continue

      seen[next] = round
      cost[next] = spent
      parent[next] = tile
      pushTile(heap, next, spent + heuristic(next))
    }
  }

  return null
}
