import { labelComponents } from '@/core/lib/play/concordat/map/grid'
import { CONCORDAT } from '@/declarations/play/concordat/rules'

/**
 * Land mask without tiny islets and lakes
 * @param {Float32Array} heights - Heights
 * @param {number} seaLevel - Sea level
 * @param {number} width - Width
 * @param {number} height - Height
 * @return {Uint8Array} - Land mask
 */

export const buildLand = (
  heights: Float32Array,
  seaLevel: number,
  width: number,
  height: number
): Uint8Array => {
  const land = new Uint8Array(heights.length)
  for (let tile = 0; tile < heights.length; tile++) land[tile] = heights[tile] > seaLevel ? 1 : 0

  // Drop islets
  const islands = labelComponents(land, width, height)
  for (let tile = 0; tile < land.length; tile++) {
    if (land[tile] && islands.sizes[islands.label[tile]] < CONCORDAT.map.minIslet) land[tile] = 0
  }

  // Fill inland lakes
  const sea = new Uint8Array(land.length)
  for (let tile = 0; tile < land.length; tile++) sea[tile] = land[tile] ? 0 : 1
  const lakes = labelComponents(sea, width, height)
  for (let tile = 0; tile < land.length; tile++) {
    const id = lakes.label[tile]
    if (id && !lakes.touchesEdge[id] && lakes.sizes[id] < CONCORDAT.map.minLake) land[tile] = 1
  }

  return land
}
