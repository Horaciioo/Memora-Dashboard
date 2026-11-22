// Rows where a raster glitch cut a one-pixel sea line through land
export const SEAM_SLITS = 100

/**
 * Fill the one-pixel sea slits of every glitched row, land above and below
 * @param {Uint8Array} mask - Land mask, 1 land
 * @param {number} width - Width
 * @param {number} height - Height
 * @return {number[]} - Rows repaired
 */

export const repairSeams = (mask, width, height) => {
  const fixed = []
  const isSlit = (row, column) => {
    const at = row * width + column

    return !mask[at] && mask[at - width] && mask[at + width]
  }

  for (let row = 1; row < height - 1; row++) {
    let slits = 0
    for (let column = 0; column < width; column++) if (isSlit(row, column)) slits++
    if (slits < SEAM_SLITS) continue

    for (let column = 0; column < width; column++)
      if (isSlit(row, column)) mask[row * width + column] = 1
    fixed.push(row)
  }

  return fixed
}
