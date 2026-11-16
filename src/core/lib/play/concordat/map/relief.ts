import { fractalNoise } from '@/core/lib/play/concordat/map/noise'
import { CONCORDAT_PATCHES, CONCORDAT_RANGES } from '@/declarations/play/concordat/world'
import type { ConcordatWindow } from '@/declarations/play/concordat/world'

interface Frame {
  window: ConcordatWindow
  pixels: number
  width: number
  height: number
}

// Distance from a point to a segment, in degrees
const segmentDistance = (
  px: number,
  py: number,
  [ax, ay]: number[],
  [bx, by]: number[]
): number => {
  const dx = bx - ax
  const dy = by - ay
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1)))

  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
}

/**
 * Relief of the real world, sea is -1 and land is 0 to 1
 * @param {number} seed - Map seed
 * @param {Frame} frame - Window and tile size
 * @param {Uint8Array} land - Land mask
 * @param {number} scale - Noise wavelength in tiles
 * @return {Float32Array} - Heights
 */

export const buildHeights = (
  seed: number,
  frame: Frame,
  land: Uint8Array,
  scale: number
): Float32Array => {
  const { window, pixels, width, height } = frame
  const heights = new Float32Array(width * height).fill(-1)
  const ranges = new Float32Array(width * height)

  // Ranges lift the tiles near their line
  for (const range of CONCORDAT_RANGES) {
    const reach = range.reach * 1.7
    for (let index = 0; index + 1 < range.points.length; index++) {
      const [a, b] = [range.points[index], range.points[index + 1]]
      const x0 = Math.floor((Math.min(a[0], b[0]) - reach - window.lonMin) * pixels)
      const x1 = Math.ceil((Math.max(a[0], b[0]) + reach - window.lonMin) * pixels)
      const y0 = Math.floor((window.latMax - Math.max(a[1], b[1]) - reach) * pixels)
      const y1 = Math.ceil((window.latMax - Math.min(a[1], b[1]) + reach) * pixels)
      for (let y = Math.max(0, y0); y < Math.min(height, y1); y++) {
        for (let x = Math.max(0, x0); x < Math.min(width, x1); x++) {
          const distance = segmentDistance(
            window.lonMin + (x + 0.5) / pixels,
            window.latMax - (y + 0.5) / pixels,
            a,
            b
          )
          const lift = range.power * Math.max(0, 1 - distance / reach) ** 1.3
          if (lift > ranges[y * width + x]) ranges[y * width + x] = lift
        }
      }
    }
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tile = y * width + x
      if (!land[tile]) continue
      const rough = fractalNoise(seed, x / scale, y / scale, 5)
      const highland = Math.max(
        0,
        fractalNoise(seed + 313, x / (scale * 3), y / (scale * 3), 3) - 0.62
      )
      const ridge = ranges[tile] * (0.8 + 0.3 * rough)
      heights[tile] = Math.min(1, 0.04 + 0.4 * rough + highland * 0.9 + ridge * 0.75)
    }
  }

  return heights
}

/**
 * Dry (negative) or wet (positive) bias of every tile, -1 to 1
 * @param {Frame} frame - Window and tile size
 * @return {Float32Array} - Climate
 */

export const buildClimate = (frame: Frame): Float32Array => {
  const { window, pixels, width, height } = frame
  const climate = new Float32Array(width * height)

  for (const patch of CONCORDAT_PATCHES) {
    const x0 = Math.max(0, Math.floor((patch.lon - patch.rx - window.lonMin) * pixels))
    const x1 = Math.min(width, Math.ceil((patch.lon + patch.rx - window.lonMin) * pixels))
    const y0 = Math.max(0, Math.floor((window.latMax - patch.lat - patch.ry) * pixels))
    const y1 = Math.min(height, Math.ceil((window.latMax - patch.lat + patch.ry) * pixels))
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const dx = (window.lonMin + (x + 0.5) / pixels - patch.lon) / patch.rx
        const dy = (window.latMax - (y + 0.5) / pixels - patch.lat) / patch.ry
        const weight = Math.max(0, 1 - (dx * dx + dy * dy)) ** 0.6
        climate[y * width + x] = Math.max(
          -1,
          Math.min(1, climate[y * width + x] + patch.bias * weight)
        )
      }
    }
  }

  return climate
}
