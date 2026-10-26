// Track precision, centimetres
const UNITS = 100

// Numbers per frame, x y z
const STRIDE = 3

/**
 * Spot written on a track
 * @param {number} x - Metres
 * @param {number} y - Metres
 * @param {number} z - Metres
 * @return {[number, number, number]} - Centimetres
 */

export const pathPoint = (x: number, y: number, z: number): [number, number, number] => [
  Math.round(x * UNITS),
  Math.round(y * UNITS),
  Math.round(z * UNITS),
]

/**
 * Frames held by a track
 * @param {number[]} path - Track
 * @return {number} - Frames
 */

export const pathLength = (path: number[]): number => Math.floor(path.length / STRIDE)

/**
 * Spot of a track between two frames
 * @param {number[]} path - Track
 * @param {number} frame - Fractional frame
 * @return {{ x: number, y: number, z: number }} - Metres
 */

export const pathAt = (path: number[], frame: number): { x: number; y: number; z: number } => {
  const last = pathLength(path) - 1
  if (last < 0) return { x: 0, y: 0, z: 0 }
  const clamped = Math.min(last, Math.max(0, frame))
  const index = Math.floor(clamped)
  const next = Math.min(last, index + 1)
  const blend = clamped - index
  const read = (axis: number) =>
    (path[index * STRIDE + axis] +
      (path[next * STRIDE + axis] - path[index * STRIDE + axis]) * blend) /
    UNITS

  return { x: read(0), y: read(1), z: read(2) }
}

/**
 * Track length in ms
 * @param {{ frames: number, frameMs: number }} shot - Played shot
 * @return {number} - Duration
 */

export const shotDuration = ({ frames, frameMs }: { frames: number; frameMs: number }): number =>
  Math.max(0, frames - 1) * frameMs
