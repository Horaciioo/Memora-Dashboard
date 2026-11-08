import { boosted, slab } from '@/declarations/play/golf/courses/build'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'
import { GolfSurfaces } from '@/utils/constants/play'

/**
 * Le Rectangle: a long diagonal over sand, or a plate and a fan that bring it home
 * @return {GolfHoleLayout} - Hole
 */

export const rectangleHole = (): GolfHoleLayout => ({
  tee: [8, 1.5],
  cup: [-8, 10],
  par: 3,
  pads: [
    slab(-10, 0, 8, 5, 0),
    slab(-2, 0, 12, 3, 0),
    boosted(slab(6.5, 3, 3, 2, 0), [0, 1]),
    slab(-2, 3, 8.5, 2, 0),
    slab(-10, 5, 8, 3, 0),
    slab(-2, 5, 4, 3, 0, 0, { surface: GolfSurfaces.Sand }),
    slab(2, 5, 8, 3, 0),
    slab(-10, 8, 20, 4, 0),
  ],
  fans: [{ at: [6, 8.5], size: [4, 3], push: [-1, 0.15] }],
  orbs: [[1, 6.5]],
})
