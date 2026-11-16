import { neighborsOf, NEIGHBOR_SLOTS } from '@/core/lib/play/concordat/map/grid'
import { fractalNoise } from '@/core/lib/play/concordat/map/noise'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import { ConcordatTerrains } from '@/utils/constants/concordat'

/**
 * Terrain of every tile from relief and the land mask
 * @param {Object} input - Relief
 * @param {number} input.seed - Map seed
 * @param {number} input.width - Width
 * @param {number} input.height - Height
 * @param {Float32Array} input.heights - Heights
 * @param {Uint8Array} input.land - Land mask
 * @param {number} input.seaLevel - Sea level
 * @param {Float32Array} input.climate - Dry or wet bias
 * @return {Uint8Array} - Terrain ids
 */

export const classifyTerrain = (input: {
  seed: number
  width: number
  height: number
  heights: Float32Array
  land: Uint8Array
  seaLevel: number
  climate: Float32Array
}): Uint8Array => {
  const { seed, width, height, heights, land, seaLevel, climate } = input
  const { map } = CONCORDAT
  const terrain = new Uint8Array(land.length)
  const near = new Int32Array(NEIGHBOR_SLOTS)

  // Highest land
  let top = seaLevel
  for (let tile = 0; tile < heights.length; tile++)
    if (land[tile]) top = Math.max(top, heights[tile])
  const span = Math.max(1e-6, top - seaLevel)

  for (let tile = 0; tile < land.length; tile++) {
    if (!land[tile]) continue

    // Coast touches the sea
    const count = neighborsOf(tile, width, height, near)
    let isCoast = false
    for (let slot = 0; slot < count; slot++) if (!land[near[slot]]) isCoast = true

    const x = tile % width
    const y = (tile - x) / width
    const elevation = (heights[tile] - seaLevel) / span
    const moisture = fractalNoise(seed + 7001, x / 30, y / 30, 3) + climate[tile] * 0.4
    const river = Math.abs(fractalNoise(seed + 9001, x / 55, y / 55, 3) - 0.5)

    // First match wins
    if (elevation > map.mountain) terrain[tile] = ConcordatTerrains.Mountain
    else if (elevation > map.hill) terrain[tile] = ConcordatTerrains.Hill
    else if (isCoast) terrain[tile] = ConcordatTerrains.Coast
    else if (river < map.riverBand && elevation < 0.4) terrain[tile] = ConcordatTerrains.Sea
    else if (moisture > map.forestMoisture) terrain[tile] = ConcordatTerrains.Forest
    else if (moisture < map.desertMoisture) terrain[tile] = ConcordatTerrains.Desert
    else terrain[tile] = ConcordatTerrains.Plain
  }

  // A river is water, never owned: its banks become shore so a boat can cross
  for (let tile = 0; tile < land.length; tile++) {
    if (!land[tile] || terrain[tile] === ConcordatTerrains.Sea) continue
    if (terrain[tile] === ConcordatTerrains.Mountain) continue

    const count = neighborsOf(tile, width, height, near)
    for (let slot = 0; slot < count; slot++) {
      if (land[near[slot]] && terrain[near[slot]] === ConcordatTerrains.Sea) {
        terrain[tile] = ConcordatTerrains.Coast
        break
      }
    }
  }

  return terrain
}
