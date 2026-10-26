import type { GolfHole, GolfPoint, GolfWall } from '@/core/lib/play/golf/types'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'

// Parallel below this
const TINY = 1e-9

/**
 * First wall met by a ray
 * @param {GolfWall[]} walls - Walls
 * @param {GolfPoint} from - Start
 * @param {GolfPoint} direction - Unit direction
 * @param {number} floor - Ball height
 * @return {{ t: number, wall: GolfWall } | null} - Distance and wall
 */

const firstWall = (
  walls: GolfWall[],
  [x, z]: GolfPoint,
  [dx, dz]: GolfPoint,
  floor: number
): { t: number; wall: GolfWall } | null => {
  let best: { t: number; wall: GolfWall } | null = null
  const { ballRadius } = GOLF_SETTINGS.physics
  for (const wall of walls) {
    // Only walls at this level
    const top = Math.max(wall.fa, wall.fb) + wall.top
    if (floor >= top || floor < Math.min(wall.fa, wall.fb) - GOLF_SETTINGS.physics.stepUp) continue
    const ex = wall.bx - wall.ax
    const ez = wall.bz - wall.az
    const cross = dx * ez - dz * ex
    if (Math.abs(cross) < TINY) continue
    const t = ((wall.ax - x) * ez - (wall.az - z) * ex) / cross
    const along = ((wall.ax - x) * dz - (wall.az - z) * dx) / cross
    if (t <= ballRadius || along < 0 || along > 1) continue
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
  const hit = firstWall(hole.walls, from, direction, floor)
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
