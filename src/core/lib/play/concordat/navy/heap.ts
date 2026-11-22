/**
 * Min-heap of tiles ordered by score
 * @typedef {Object} TileHeap
 */

export interface TileHeap {
  tiles: number[]
  scores: number[]
}

/**
 * Add a tile
 * @param {TileHeap} heap - Heap
 * @param {number} tile - Tile
 * @param {number} score - Priority, lowest first
 * @return {void}
 */

export const pushTile = (heap: TileHeap, tile: number, score: number): void => {
  const { tiles, scores } = heap
  let at = tiles.length
  tiles.push(tile)
  scores.push(score)

  // Sift up
  while (at > 0) {
    const parent = (at - 1) >> 1
    if (scores[parent] <= score) break
    tiles[at] = tiles[parent]
    scores[at] = scores[parent]
    at = parent
  }
  tiles[at] = tile
  scores[at] = score
}

/**
 * Take the lowest score
 * @param {TileHeap} heap - Heap, not empty
 * @return {number} - Tile
 */

export const popTile = (heap: TileHeap): number => {
  const { tiles, scores } = heap
  const top = tiles[0]
  const tile = tiles.pop() as number
  const score = scores.pop() as number
  if (!tiles.length) return top

  // Sift down from the root
  let at = 0
  for (;;) {
    let child = at * 2 + 1
    if (child >= tiles.length) break
    if (child + 1 < tiles.length && scores[child + 1] < scores[child]) child++
    if (scores[child] >= score) break
    tiles[at] = tiles[child]
    scores[at] = scores[child]
    at = child
  }
  tiles[at] = tile
  scores[at] = score

  return top
}
