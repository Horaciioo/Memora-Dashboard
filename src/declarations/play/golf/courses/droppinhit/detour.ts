import { boosted, slab } from '@/declarations/play/golf/courses/build'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'
import { GolfSurfaces } from '@/utils/constants/play'

/**
 * Le Contournement: a U round a void, sand and a headwind on the short side, a plate on the long one
 * @return {GolfHoleLayout} - Hole
 */

export const detourHole = (): GolfHoleLayout => ({
  tee: [-7, 1.5],
  cup: [7, 12.5],
  par: 3,
  pads: [
    slab(-9, 0, 14, 4, 0),
    boosted(slab(5, 0, 4, 2, 0), [0, 1]),
    slab(5, 2, 4, 2, 0),
    slab(-9, 4, 4, 6, 0),
    slab(5, 4, 4, 6, 0),
    slab(-9, 10, 6, 4, 0),
    slab(-3, 10, 3, 4, 0, 0, { surface: GolfSurfaces.Sand }),
    slab(0, 10, 9, 4, 0),
  ],
  fans: [{ at: [1, 10], size: [3, 4], push: [-1, 0] }],
  bumpers: [{ at: [4.5, 12], radius: 0.4 }],
  orbs: [[-7, 7]],
})
