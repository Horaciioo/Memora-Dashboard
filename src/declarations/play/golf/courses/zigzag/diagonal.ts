import { slab } from '@/declarations/play/golf/courses/build'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'

/**
 * Le Saut de diagonale: a ring in front of the tee drops the ball on a far strip, cup straight ahead
 * @return {GolfHoleLayout} - Hole
 */

export const diagonalHole = (): GolfHoleLayout => ({
  tee: [0, 1.5],
  cup: [9, 18],
  par: 2,
  pads: [slab(-2, 0, 4, 8), slab(7.5, 10, 3, 12)],
  portals: [{ from: [0, 6.5], to: [9, 12], heading: 0 }],
  orbs: [
    [0, 4],
    [9, 15],
  ],
})
