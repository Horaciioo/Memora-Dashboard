import { boosted, slab } from '@/declarations/play/golf/courses/build'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'

/**
 * Le Pur-sang: a long lane with a soft S, two boosts, then a bumper triangle
 * @return {GolfHoleLayout} - Hole
 */

export const thoroughbredHole = (): GolfHoleLayout => ({
  tee: [0, 1.5],
  cup: [0, 25.5],
  par: 3,
  pads: [
    slab(-1.5, 0, 3, 5.5),
    boosted(slab(-1.5, 5.5, 3, 2), [0, 1]),
    slab(-1.5, 7.5, 3, 0.5),
    slab(-0.7, 8, 3, 5),
    boosted(slab(-0.7, 13, 3, 2), [0, 1]),
    slab(-0.7, 15, 3, 2),
    slab(-1.5, 17, 3, 7),
    slab(-1.5, 24, 3, 3),
  ],
  bumpers: [
    { at: [0, 19.4], radius: 0.4 },
    { at: [-0.55, 21], radius: 0.4 },
    { at: [0.55, 21], radius: 0.4 },
  ],
  orbs: [
    [-1, 20],
    [1, 20],
  ],
})
