import { neighborsOf, NEIGHBOR_SLOTS } from '@/core/lib/play/concordat/map/grid'
import type { ConcordatMap } from '@/types/concordat'
import { ConcordatTerrains } from '@/utils/constants/concordat'

/**
 * Colours and steps of a painted map
 * @typedef {Object} ConcordatTerrainLook
 */

export interface ConcordatTerrainLook {
  outline: number
  foam: readonly number[]
  relief: number
  land: readonly (readonly number[])[]
  sea: readonly number[]
  depths: readonly (readonly number[])[]
  reach: number
  warp: number
}

// Deterministic value in 0..1 from a lattice point
const hashOf = (x: number, y: number): number => {
  const mixed = Math.imul(x * 374761393 + y * 668265263, 1274126177)

  return ((mixed ^ (mixed >>> 13)) >>> 0) / 4294967295
}

// Smooth noise in 0..1, one lattice cell per `cell` tiles
const noiseOf = (x: number, y: number, cell: number): number => {
  const gx = x / cell
  const gy = y / cell
  const x0 = Math.floor(gx)
  const y0 = Math.floor(gy)
  const fx = gx - x0
  const fy = gy - y0
  const sx = fx * fx * (3 - 2 * fx)
  const sy = fy * fy * (3 - 2 * fy)
  const top = hashOf(x0, y0) * (1 - sx) + hashOf(x0 + 1, y0) * sx
  const bottom = hashOf(x0, y0 + 1) * (1 - sx) + hashOf(x0 + 1, y0 + 1) * sx

  return top * (1 - sy) + bottom * sy
}

// Tiles from the nearest land for every sea tile, capped at `reach`
const depthOf = (map: ConcordatMap, reach: number): Uint8Array => {
  const { width, height, terrain } = map
  const depth = new Uint8Array(terrain.length).fill(reach)
  let frontier: number[] = []
  for (let tile = 0; tile < terrain.length; tile++) {
    if (terrain[tile] !== ConcordatTerrains.Sea) {
      depth[tile] = 0
      frontier.push(tile)
    }
  }
  for (let step = 1; step < reach && frontier.length; step++) {
    const next: number[] = []
    for (const tile of frontier) {
      const x = tile % width
      const around = [
        x > 0 ? tile - 1 : -1,
        x < width - 1 ? tile + 1 : -1,
        tile >= width ? tile - width : -1,
        tile < width * (height - 1) ? tile + width : -1,
      ]
      for (const other of around) {
        if (other < 0 || depth[other] <= step) continue
        depth[other] = step
        next.push(other)
      }
    }
    frontier = next
  }

  return depth
}

/**
 * Land tile touching the sea, or sea tile touching land
 * @param {ConcordatMap} map - Map
 * @param {number} tile - Tile
 * @return {boolean} - On the shore
 */

export const isShore = (map: ConcordatMap, tile: number): boolean => {
  const { width, height, terrain } = map
  const near = new Int32Array(NEIGHBOR_SLOTS)
  const isSea = terrain[tile] === ConcordatTerrains.Sea
  const count = neighborsOf(tile, width, height, near)
  for (let slot = 0; slot < count; slot++) {
    if ((terrain[near[slot]] === ConcordatTerrains.Sea) !== isSea) return true
  }

  return false
}

/**
 * Colour of every tile: flat sea, white line along the shore
 * @param {ConcordatMap} map - Map
 * @param {ConcordatTerrainLook} look - Colours
 * @return {ImageData} - One pixel per tile
 */

export const paintTerrain = (map: ConcordatMap, look: ConcordatTerrainLook): ImageData => {
  const { width, terrain } = map
  const image = new ImageData(width, map.height)
  const { land, relief, outline, foam, depths, reach, warp } = look
  const depth = depthOf(map, reach)

  for (let tile = 0; tile < terrain.length; tile++) {
    const kind = terrain[tile]
    const at = tile * 4
    const isSea = kind === ConcordatTerrains.Sea
    let rgb: readonly number[] = land[kind]
    if (isSea) {
      // Depth steps from shallow to deep, edges bent by two scales of noise
      const x = tile % width
      const y = Math.floor(tile / width)
      const bend = noiseOf(x, y, 14) * 0.7 + noiseOf(x, y, 5) * 0.3 - 0.5
      const field = Math.min(1, depth[tile] / reach) + bend * warp
      const step = Math.floor(Math.max(0, Math.min(0.999, field)) * depths.length)
      rgb = isShore(map, tile) ? foam : depths[step]
    } else {
      const x = tile % width
      const isLit = x > 0 && tile >= width && terrain[tile - width - 1] === ConcordatTerrains.Sea
      rgb = rgb.map((value) => value + (isLit ? relief : 0))
      if (isShore(map, tile)) rgb = rgb.map((value) => value * outline)
    }
    image.data[at] = rgb[0]
    image.data[at + 1] = rgb[1]
    image.data[at + 2] = rgb[2]
    image.data[at + 3] = 255
  }

  return image
}
