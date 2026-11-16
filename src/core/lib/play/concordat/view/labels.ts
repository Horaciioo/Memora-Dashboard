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
  // Typed sums, a row at a time: the map holds millions of tiles
  const tiles = new Float64Array(count + 1)
  const sumX = new Float64Array(count + 1)
  const sumY = new Float64Array(count + 1)
  const minX = new Int32Array(count + 1).fill(width)
  const maxX = new Int32Array(count + 1).fill(-1)
  const minY = new Int32Array(count + 1).fill(0x7fffffff)
  const maxY = new Int32Array(count + 1).fill(-1)

  for (let start = 0, row = 0; start < owner.length; start += width, row++) {
    for (let column = 0; column < width; column++) {
      const holder = owner[start + column]
      if (!holder || holder > count) continue
      tiles[holder]++
      sumX[holder] += column
      sumY[holder] += row
      if (column < minX[holder]) minX[holder] = column
      if (column > maxX[holder]) maxX[holder] = column
      if (row < minY[holder]) minY[holder] = row
      maxY[holder] = row
    }
  }

  return Array.from({ length: count }, (_, index) => {
    const id = index + 1

    return {
      x: tiles[id] ? sumX[id] / tiles[id] + 0.5 : 0,
      y: tiles[id] ? sumY[id] / tiles[id] + 0.5 : 0,
      tiles: tiles[id],
      span: tiles[id] ? Math.max(maxX[id] - minX[id], maxY[id] - minY[id]) + 1 : 0,
    }
  })
}
