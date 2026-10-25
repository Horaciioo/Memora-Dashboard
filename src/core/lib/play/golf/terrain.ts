import type { GolfPad, GolfPadLayout } from '@/core/lib/play/golf/types'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'
import { GolfSurfaces } from '@/utils/constants/play'

// Edge tolerance
const EPSILON = 1e-6

/**
 * Slab from its layout
 * @param {GolfPadLayout} layout - Drawn slab
 * @return {GolfPad} - Physics slab
 */

export const toPad = ({ at, size, height = 0, rise, surface, push }: GolfPadLayout): GolfPad => {
  const slope = rise ? (rise.to - height) / (rise.axis === 'x' ? size[0] : size[1]) : 0

  return {
    x0: at[0],
    x1: at[0] + size[0],
    z0: at[1],
    z1: at[1] + size[1],
    h: height,
    gx: rise?.axis === 'x' ? slope : 0,
    gz: rise?.axis === 'z' ? slope : 0,
    surface: surface ?? GolfSurfaces.Grass,
    push: push ?? null,
  }
}

/**
 * Height of a slab at a point
 * @param {GolfPad} pad - Slab
 * @param {number} x - Point x
 * @param {number} z - Point z
 * @return {number} - Height
 */

export const padHeight = (pad: GolfPad, x: number, z: number): number =>
  pad.h + pad.gx * (x - pad.x0) + pad.gz * (z - pad.z0)

/**
 * Slab holding a point
 * @param {GolfPad} pad - Slab
 * @param {number} x - Point x
 * @param {number} z - Point z
 * @return {boolean} - Inside
 */

export const padHolds = (pad: GolfPad, x: number, z: number): boolean =>
  x >= pad.x0 - EPSILON && x <= pad.x1 + EPSILON && z >= pad.z0 - EPSILON && z <= pad.z1 + EPSILON

/**
 * Slab a ball rests on, never one above it
 * @param {GolfPad[]} pads - Slabs
 * @param {number} x - Point x
 * @param {number} z - Point z
 * @param {number} [y] - Ball height
 * @return {GolfPad | null} - Slab or the void
 */

export const padUnder = (pads: GolfPad[], x: number, z: number, y = Infinity): GolfPad | null => {
  let best: GolfPad | null = null
  let bestHeight = -Infinity
  for (const pad of pads) {
    if (!padHolds(pad, x, z)) continue
    const height = padHeight(pad, x, z)
    if (height <= y + GOLF_SETTINGS.physics.stepUp && height > bestHeight) {
      best = pad
      bestHeight = height
    }
  }

  return best
}
