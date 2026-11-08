import type { GolfSweepHit } from '@/core/lib/play/golf/colliders/types'

// Below this a length has no direction
const TINY = 1e-9

/**
 * Distance from a point to a segment
 * @param {number[]} point - x, z
 * @param {number[]} segment - ax, az, bx, bz
 * @return {number} - Distance
 */

export const segmentDistance = ([px, pz]: number[], [ax, az, bx, bz]: number[]): number => {
  const dx = bx - ax
  const dz = bz - az
  const length = dx * dx + dz * dz
  const t = length < TINY ? 0 : Math.min(1, Math.max(0, ((px - ax) * dx + (pz - az) * dz) / length))

  return Math.hypot(px - ax - dx * t, pz - az - dz * t)
}

/**
 * First time a moving point meets a circle
 * @param {number[]} move - From x, from z, step x, step z
 * @param {number[]} circle - Centre x, centre z, radius
 * @return {GolfSweepHit | null} - Contact within the step
 */

export const sweepCircle = (
  [px, pz, dx, dz]: number[],
  [cx, cz, radius]: number[]
): GolfSweepHit | null => {
  const ox = px - cx
  const oz = pz - cz
  const a = dx * dx + dz * dz
  const b = 2 * (ox * dx + oz * dz)
  const c = ox * ox + oz * oz - radius * radius
  // Already inside or moving away
  if (a < TINY || c < 0 || b >= 0) return null
  const root = b * b - 4 * a * c
  if (root < 0) return null
  const t = (-b - Math.sqrt(root)) / (2 * a)
  if (t < 0 || t > 1) return null
  const nx = (ox + dx * t) / radius
  const nz = (oz + dz * t) / radius

  return { t, nx, nz }
}

/**
 * First time a moving circle meets a segment, faces then ends
 * @param {number[]} move - From x, from z, step x, step z
 * @param {number[]} segment - ax, az, bx, bz
 * @param {number} radius - Ball radius
 * @return {GolfSweepHit | null} - Contact within the step
 */

export const sweepSegment = (
  move: number[],
  segment: number[],
  radius: number
): GolfSweepHit | null => {
  const [px, pz, dx, dz] = move
  const [ax, az, bx, bz] = segment
  if (segmentDistance([px, pz], segment) < radius) return null
  const ux = bx - ax
  const uz = bz - az
  const length = Math.hypot(ux, uz)
  let best: GolfSweepHit | null = null

  // Face, from the side the ball stands
  if (length > TINY) {
    const side = ((px - ax) * -uz + (pz - az) * ux) / length
    const nx = (-uz / length) * Math.sign(side)
    const nz = (ux / length) * Math.sign(side)
    const closing = dx * nx + dz * nz
    if (closing < 0) {
      const t = (Math.abs(side) - radius) / -closing
      const along = ((px + dx * t - ax) * ux + (pz + dz * t - az) * uz) / (length * length)
      if (t >= 0 && t <= 1 && along >= 0 && along <= 1) best = { t, nx, nz }
    }
  }

  // Rounded ends
  for (const end of [
    [ax, az],
    [bx, bz],
  ]) {
    const hit = sweepCircle(move, [end[0], end[1], radius])
    if (hit && (!best || hit.t < best.t)) best = hit
  }

  return best
}
