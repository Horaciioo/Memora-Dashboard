import { boosted, slab } from '@/declarations/play/golf/courses/build'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'

/**
 * Le Losange: two lanes round a void, fans at their mouths bending the ball back to the middle
 * @return {GolfHoleLayout} - Hole
 */

export const diamondHole = (): GolfHoleLayout => ({
  tee: [0, 1.5],
  cup: [0, 19],
  par: 3,
  pads: [
    slab(-6.5, 0, 13, 1.2),
    slab(-3.9, 1.2, 7.8, 1.8),
    boosted(slab(-6.5, 1.2, 2.6, 1.8), [0, 1]),
    slab(-6.5, 3, 2.6, 6),
    boosted(slab(-6.5, 9, 2.6, 2), [0, 1]),
    slab(-6.5, 11, 2.6, 6),
    boosted(slab(3.9, 1.2, 2.6, 1.8), [0, 1]),
    slab(3.9, 3, 2.6, 6),
    boosted(slab(3.9, 9, 2.6, 2), [0, 1]),
    slab(3.9, 11, 2.6, 6),
    slab(-6.5, 17, 13, 4),
  ],
  fans: [
    { at: [-6.5, 12], size: [2.6, 4], push: [0.5, 0.85] },
    { at: [3.9, 12], size: [2.6, 4], push: [-0.5, 0.85] },
  ],
  orbs: [
    [-5.2, 14],
    [5.2, 14],
  ],
})
