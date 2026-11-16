/**
 * Visit every tile inside a disc
 * @param {Object} input - Disc
 * @param {number} input.width - Map width
 * @param {number} input.height - Map height
 * @param {number} input.tile - Centre
 * @param {number} input.radius - Radius in tiles
 * @param {(tile: number) => void} visit - Called for each tile
 * @return {void}
 */

export const forEachInDisc = (
  input: { width: number; height: number; tile: number; radius: number },
  visit: (tile: number) => void
): void => {
  const { width, height, tile, radius } = input
  const cx = tile % width
  const cy = Math.floor(tile / width)

  for (let y = Math.max(0, cy - radius); y <= Math.min(height - 1, cy + radius); y++) {
    for (let x = Math.max(0, cx - radius); x <= Math.min(width - 1, cx + radius); x++) {
      if ((x - cx) ** 2 + (y - cy) ** 2 <= radius * radius) visit(y * width + x)
    }
  }
}

/**
 * Straight distance between two tiles
 * @param {number} first - Tile
 * @param {number} second - Tile
 * @param {number} width - Map width
 * @return {number} - Distance in tiles
 */

export const reachOf = (first: number, second: number, width: number): number =>
  Math.hypot(
    (first % width) - (second % width),
    Math.floor(first / width) - Math.floor(second / width)
  )
