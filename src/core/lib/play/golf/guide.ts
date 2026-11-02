import { padHeight, padUnder } from '@/core/lib/play/golf/terrain'
import type { GolfHole, GolfPad, GolfPoint, GolfWall } from '@/core/lib/play/golf/types'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'

// Parallel below this
const TINY = 1e-9

// Height a ball must clear a wall top by
const CLEAR = 1e-3

// Metres between two ground reads along the line
const PROFILE_STEP = 0.1

/**
 * Ground met by a rolling ball, climbing ramps from the last level
 * @param {GolfPad[]} pads - Slabs
 * @param {number} x - Point x
 * @param {number} z - Point z
 * @param {number} level - Ground just before
 * @return {number} - Ground height, the last level over the void
 */

export const groundFrom = (pads: GolfPad[], x: number, z: number, level: number): number => {
  const pad = padUnder(pads, x, z, level)

  return pad ? padHeight(pad, x, z) : level
}

/**
 * Ground along a straight line, one read per step
 * @param {GolfPad[]} pads - Slabs
 * @param {GolfPoint} from - Start
 * @param {GolfPoint} direction - Unit direction
 * @param {Object} span - Line
 * @param {number} span.floor - Ground at the start
 * @param {number} span.length - Metres read
 * @return {(t: number) => number} - Ground at a distance
 */

const groundProfile = (
  pads: GolfPad[],
  [x, z]: GolfPoint,
  [dx, dz]: GolfPoint,
  { floor, length }: { floor: number; length: number }
): ((t: number) => number) => {
  const levels = [floor]
  for (let t = PROFILE_STEP; t <= length + PROFILE_STEP; t += PROFILE_STEP) {
    levels.push(groundFrom(pads, x + dx * t, z + dz * t, levels[levels.length - 1]))
  }

  return (t) => levels[Math.min(levels.length - 1, Math.max(0, Math.round(t / PROFILE_STEP)))]
}

/**
 * First wall met by a ray, at the ground the ball has climbed to
 * @param {GolfWall[]} walls - Walls
 * @param {GolfPoint} from - Start
 * @param {GolfPoint} direction - Unit direction
 * @param {(t: number) => number} groundAt - Ground at a distance
 * @return {{ t: number, wall: GolfWall } | null} - Distance and wall
 */

const firstWall = (
  walls: GolfWall[],
  [x, z]: GolfPoint,
  [dx, dz]: GolfPoint,
  groundAt: (t: number) => number
): { t: number; wall: GolfWall } | null => {
  let best: { t: number; wall: GolfWall } | null = null
  const { ballRadius, stepUp } = GOLF_SETTINGS.physics
  for (const wall of walls) {
    const ex = wall.bx - wall.ax
    const ez = wall.bz - wall.az
    const cross = dx * ez - dz * ex
    if (Math.abs(cross) < TINY) continue
    const t = ((wall.ax - x) * ez - (wall.az - z) * ex) / cross
    const along = ((wall.ax - x) * dz - (wall.az - z) * dx) / cross
    if (t <= ballRadius || along < 0 || along > 1) continue
    // Same rule as the roll: another floor, or clear over the top
    const base = wall.fa + (wall.fb - wall.fa) * along
    const level = groundAt(t)
    if (level < base - stepUp || level >= base + wall.top - CLEAR) continue
    if (!best || t < best.t) best = { t, wall }
  }

  return best
}

/**
 * Dotted line of an aim: straight to the first wall, then its bounce
 * @param {GolfHole} hole - Hole
 * @param {Object} aim - Aim
 * @param {GolfPoint} aim.from - Ball spot
 * @param {number} aim.floor - Ball height
 * @param {number} aim.angle - Shot angle
 * @param {number} aim.power - Pull
 * @return {GolfPoint[]} - Polyline
 */

export const aimGuide = (
  hole: GolfHole,
  { from, floor, angle, power }: { from: GolfPoint; floor: number; angle: number; power: number }
): GolfPoint[] => {
  const { guideMeters, guideBounce } = GOLF_SETTINGS.aim
  const direction: GolfPoint = [Math.sin(angle), Math.cos(angle)]
  const reach = guideMeters * power
  const groundAt = groundProfile(hole.pads, from, direction, { floor, length: reach })
  const hit = firstWall(hole.walls, from, direction, groundAt)
  if (!hit || hit.t >= reach) {
    return [from, [from[0] + direction[0] * reach, from[1] + direction[1] * reach]]
  }

  // Mirror on the wall line
  const corner: GolfPoint = [from[0] + direction[0] * hit.t, from[1] + direction[1] * hit.t]
  const ex = hit.wall.bx - hit.wall.ax
  const ez = hit.wall.bz - hit.wall.az
  const length = Math.hypot(ex, ez)
  const nx = -ez / length
  const nz = ex / length
  const dot = direction[0] * nx + direction[1] * nz
  const bounce: GolfPoint = [direction[0] - 2 * dot * nx, direction[1] - 2 * dot * nz]
  const rest = Math.min(reach - hit.t, guideBounce * power)

  return [from, corner, [corner[0] + bounce[0] * rest, corner[1] + bounce[1] * rest]]
}
