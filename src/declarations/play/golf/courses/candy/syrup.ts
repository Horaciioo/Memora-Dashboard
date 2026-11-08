import { boosted, slab } from '@/declarations/play/golf/courses/build'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'
import { GolfSurfaces } from '@/utils/constants/play'

const water = { surface: GolfSurfaces.Water }

/**
 * Le Lac de sirop: a syrup lake, a short sugar bridge ending on a marshmallow and a long one with a boost
 * @return {GolfHoleLayout} - Hole
 */

export const syrupHole = (): GolfHoleLayout => ({
  tee: [0, 1.5],
  cup: [0, 17],
  par: 3,
  pads: [
    slab(-4, 0, 8, 4),
    slab(-6, 4, 2.4, 8, 0, 0, water),
    slab(-3.6, 4, 1.2, 8),
    slab(-2.4, 4, 4.8, 8, 0, 0, water),
    boosted(slab(2.4, 4, 1.2, 3), [0, 1]),
    slab(2.4, 7, 1.2, 5),
    slab(3.6, 4, 2.4, 8, 0, 0, water),
    slab(-6, 12, 12, 8),
  ],
  bumpers: [{ at: [-3, 13.2], radius: 0.4 }],
  orbs: [
    [3, 9.5],
    [0, 15],
  ],
})
