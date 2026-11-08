import type { GolfPad, GolfWall } from '@/core/lib/play/golf'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'

// Inset before a point counts as over a slab
const INSET = 0.01

/**
 * Point standing over the floor of a slab
 * @param {GolfPad[]} pads - Slabs
 * @param {number} x - X
 * @param {number} z - Z
 * @return {boolean} - Over a floor
 */

const isOverFloor = (pads: GolfPad[], x: number, z: number): boolean =>
  pads.some(
    (pad) => x > pad.x0 + INSET && x < pad.x1 - INSET && z > pad.z0 + INSET && z < pad.z1 - INSET
  )

/**
 * Ends of a rail allowed to stretch past their point, never into a floor
 * @param {GolfWall} wall - Rail
 * @param {GolfPad[]} pads - Slabs
 * @return {{ a: boolean, b: boolean }} - Stretch at the start and at the end
 */

export const railEnds = (wall: GolfWall, pads: GolfPad[]): { a: boolean; b: boolean } => {
  const length = Math.hypot(wall.bx - wall.ax, wall.bz - wall.az) || 1
  const ux = (wall.bx - wall.ax) / length
  const uz = (wall.bz - wall.az) / length
  const reach = GOLF_SETTINGS.render.railWidth
  // Stretched tip and its outer corner
  const clear = (x: number, z: number, side: 1 | -1): boolean =>
    !isOverFloor(pads, x + side * ux * reach, z + side * uz * reach) &&
    !isOverFloor(
      pads,
      x + side * ux * reach + wall.nx * reach,
      z + side * uz * reach + wall.nz * reach
    )

  return {
    a: !wall.cutA && clear(wall.ax, wall.az, -1),
    b: !wall.cutB && clear(wall.bx, wall.bz, 1),
  }
}
