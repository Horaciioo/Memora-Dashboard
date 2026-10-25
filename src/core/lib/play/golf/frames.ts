// Track precision, centimetres
const UNITS = 100

/**
 * Spot written on a track
 * @param {number} x - Metres
 * @param {number} z - Metres
 * @return {[number, number]} - Centimetres
 */

export const pathPoint = (x: number, z: number): [number, number] => [
  Math.round(x * UNITS),
  Math.round(z * UNITS),
]

/**
 * Frames held by a track
 * @param {number[]} path - Track
 * @return {number} - Frames
 */

export const pathLength = (path: number[]): number => path.length / 2

/**
 * Spot of a track between two frames
 * @param {number[]} path - Track
 * @param {number} frame - Fractional frame
 * @return {{ x: number, z: number }} - Metres
 */

export const pathAt = (path: number[], frame: number): { x: number; z: number } => {
  const last = pathLength(path) - 1
  if (last < 0) return { x: 0, z: 0 }
  const clamped = Math.min(last, Math.max(0, frame))
  const index = Math.floor(clamped)
  const next = Math.min(last, index + 1)
  const blend = clamped - index

  return {
    x: (path[index * 2] + (path[next * 2] - path[index * 2]) * blend) / UNITS,
    z: (path[index * 2 + 1] + (path[next * 2 + 1] - path[index * 2 + 1]) * blend) / UNITS,
  }
}

/**
 * Track length in ms
 * @param {{ frames: number, frameMs: number }} shot - Played shot
 * @return {number} - Duration
 */

export const shotDuration = ({ frames, frameMs }: { frames: number; frameMs: number }): number =>
  Math.max(0, frames - 1) * frameMs
