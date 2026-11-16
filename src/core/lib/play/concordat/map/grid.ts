// Reused neighbour buffer size
export const NEIGHBOR_SLOTS = 4

/**
 * Four neighbours of a tile
 * @param {number} index - Tile
 * @param {number} width - Map width
 * @param {number} height - Map height
 * @param {Int32Array} out - Filled buffer
 * @return {number} - Neighbour count
 */

export const neighborsOf = (
  index: number,
  width: number,
  height: number,
  out: Int32Array
): number => {
  const x = index % width
  const y = (index - x) / width
  let count = 0

  // Four sides
  if (x > 0) out[count++] = index - 1
  if (x < width - 1) out[count++] = index + 1
  if (y > 0) out[count++] = index - width
  if (y < height - 1) out[count++] = index + width

  return count
}

/**
 * Straight distance in tiles
 * @param {number} first - Tile
 * @param {number} second - Tile
 * @param {number} width - Map width
 * @return {number} - Distance
 */

export const distanceBetween = (first: number, second: number, width: number): number => {
  const dx = (first % width) - (second % width)
  const dy = Math.floor(first / width) - Math.floor(second / width)

  return Math.hypot(dx, dy)
}

/**
 * Connected groups of tiles that share a flag
 * @param {Uint8Array} mask - Non-zero tiles belong
 * @param {number} width - Map width
 * @param {number} height - Map height
 * @return {{ label: Int32Array, sizes: number[], touchesEdge: boolean[] }} - Components from one
 */

export const labelComponents = (
  mask: Uint8Array,
  width: number,
  height: number
): { label: Int32Array; sizes: number[]; touchesEdge: boolean[] } => {
  const label = new Int32Array(mask.length)
  const sizes = [0]
  const touchesEdge = [false]
  const queue = new Int32Array(mask.length)
  const near = new Int32Array(NEIGHBOR_SLOTS)

  for (let start = 0; start < mask.length; start++) {
    if (!mask[start] || label[start]) continue

    // Flood from the first tile
    const id = sizes.length
    let head = 0
    let tail = 0
    let edge = false
    queue[tail++] = start
    label[start] = id
    while (head < tail) {
      const tile = queue[head++]
      const x = tile % width
      const y = (tile - x) / width
      if (x === 0 || y === 0 || x === width - 1 || y === height - 1) edge = true
      const count = neighborsOf(tile, width, height, near)
      for (let slot = 0; slot < count; slot++) {
        const next = near[slot]
        if (mask[next] && !label[next]) {
          label[next] = id
          queue[tail++] = next
        }
      }
    }
    sizes.push(tail)
    touchesEdge.push(edge)
  }

  return { label, sizes, touchesEdge }
}
