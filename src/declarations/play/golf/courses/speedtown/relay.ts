import { boosted, cushion, slab } from '@/declarations/play/golf/courses/build'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'

/**
 * Le Relais
 * @return {GolfHoleLayout} - Hole
 */

export const relayHole = (): GolfHoleLayout => ({
  tee: [0, 1.5],
  cup: [10, 14.5],
  par: 3,
  pads: [
    slab(-3, 0, 6, 5),
    slab(-3, 5, 6, 1.5, 0, 0.3),
    boosted(slab(-3, 6.5, 2, 2.2, 0.3, 0.9), [0.3, 1]),
    boosted(slab(-1, 6.5, 2, 2.2, 0.3, 0.9), [0, 1]),
    boosted(slab(1, 6.5, 2, 2.2, 0.3, 0.9), [-0.3, 1]),
    slab(-3, 8.7, 6, 3.3, 0.9, 2.1),
    slab(-3, 12, 6, 4, 2.1),
    slab(3, 13.3, 9, 2.4, 2.1),
  ],
  rails: [cushion([-2, 12.8], [1.4, 16], [-1, 1])],
  fans: [{ at: [3, 13.3], size: [3, 2.4], push: [1, 0] }],
  orbs: [
    [0, 10],
    [7, 14.5],
  ],
})
