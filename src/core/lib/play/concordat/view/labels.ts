/**
 * Where a nation sits on the map
 * @typedef {Object} ConcordatPlace
 */

export interface ConcordatPlace {
  // Mean tile column and row
  x: number
  y: number
  tiles: number
  // Widest side of its box in tiles
  span: number
}

/**
 * Centre and size of every nation in one pass
 * @param {Uint8Array} owner - Owner layer
 * @param {number} width - Map width
 * @param {number} count - Nation count
 * @return {ConcordatPlace[]} - Index is the id minus one
 */

export const placesOf = (owner: Uint8Array, width: number, count: number): ConcordatPlace[] => {
  const sums = Array.from({ length: count }, () => ({
    x: 0,
    y: 0,
    tiles: 0,
    minX: Infinity,
    maxX: -Infinity,
    minY: Infinity,
    maxY: -Infinity,
  }))

  for (let tile = 0; tile < owner.length; tile++) {
    const sum = sums[owner[tile] - 1]
    if (!sum) continue
    const column = tile % width
    const row = (tile - column) / width
    sum.x += column
    sum.y += row
    sum.tiles++
    sum.minX = Math.min(sum.minX, column)
    sum.maxX = Math.max(sum.maxX, column)
    sum.minY = Math.min(sum.minY, row)
    sum.maxY = Math.max(sum.maxY, row)
  }

  return sums.map((sum) => ({
    x: sum.tiles ? sum.x / sum.tiles + 0.5 : 0,
    y: sum.tiles ? sum.y / sum.tiles + 0.5 : 0,
    tiles: sum.tiles,
    span: sum.tiles ? Math.max(sum.maxX - sum.minX, sum.maxY - sum.minY) + 1 : 0,
  }))
}
