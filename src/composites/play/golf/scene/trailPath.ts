import { Vector3 } from 'three'

export interface TrailSample {
  position: Vector3
  forward: Vector3
}

export interface TrailState {
  points: Vector3[]
  samples: TrailSample[]
  mix: Float32Array
  head: Vector3
  last: Vector3
  hasLast: boolean
  speed: number
  time: number
}

/**
 * Fresh trail memory
 * @param {number} rows - Row count
 * @param {number} tiles - Tile count
 * @return {TrailState} - Empty state
 */

export const makeTrailState = (rows: number, tiles: number): TrailState => ({
  points: [],
  samples: Array.from({ length: rows }, () => ({
    position: new Vector3(),
    forward: new Vector3(1, 0, 0),
  })),
  mix: new Float32Array(tiles),
  head: new Vector3(),
  last: new Vector3(),
  hasLast: false,
  speed: 0,
  time: 0,
})

/**
 * Remember the head each step
 * @param {Vector3[]} points - Past spots, oldest first
 * @param {Vector3} head - Ball spot
 * @param {number} step - Min gap
 * @param {number} limit - Max points
 * @return {void}
 */

export const recordPath = (points: Vector3[], head: Vector3, step: number, limit: number): void => {
  const last = points.at(-1)
  if (last && last.distanceTo(head) < step) return
  points.push(head.clone())
  if (points.length > limit) points.shift()
}

/**
 * Spots along the path behind the head
 * @param {Object} path - Path and spacing
 * @param {Vector3[]} path.points - Past spots, oldest first
 * @param {Vector3} path.head - Ball spot
 * @param {number} path.start - First distance
 * @param {number} path.pitch - Row gap
 * @param {TrailSample[]} path.out - Samples to fill
 * @return {number} - Rows reached
 */

export const samplePath = ({
  points,
  head,
  start,
  pitch,
  out,
}: {
  points: Vector3[]
  head: Vector3
  start: number
  pitch: number
  out: TrailSample[]
}): number => {
  let node = points.length - 1
  let from = head
  let travelled = 0
  let reached = 0

  // One pass, rows ordered by distance
  for (let row = 0; row < out.length; row += 1) {
    const wanted = start + row * pitch
    let length = node >= 0 ? from.distanceTo(points[node]) : 0
    while (node >= 0 && travelled + length < wanted) {
      travelled += length
      from = points[node]
      node -= 1
      length = node >= 0 ? from.distanceTo(points[node]) : 0
    }
    if (node < 0) break

    // Point on this segment
    const sample = out[row]
    const ahead = from
    const behind = points[node]
    const along = length > 1e-6 ? (wanted - travelled) / length : 0
    sample.position.lerpVectors(ahead, behind, along)
    if (length > 1e-6) sample.forward.subVectors(ahead, behind).normalize()
    reached = row + 1
  }

  return reached
}
