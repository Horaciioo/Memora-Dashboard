import { gridOf, sweepBox } from '@/core/lib/play/golf/colliders/grid'
import type { GolfColliders } from '@/core/lib/play/golf/colliders/types'
import type { GolfHole } from '@/core/lib/play/golf/types'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'

// Built once per hole
const BUILT = new WeakMap<GolfHole, GolfColliders>()

/**
 * Static shapes of a hole and their grid
 * @param {GolfHole} hole - Hole
 * @return {GolfColliders} - Colliders
 */

export const collidersOf = (hole: GolfHole): GolfColliders => {
  const known = BUILT.get(hole)
  if (known) return known
  const boxes = hole.walls.map((wall) => sweepBox([wall.ax, wall.az, wall.bx, wall.bz], 0))
  const colliders = { walls: hole.walls, wallGrid: gridOf(boxes, GOLF_SETTINGS.physics.gridCell) }
  BUILT.set(hole, colliders)

  return colliders
}
