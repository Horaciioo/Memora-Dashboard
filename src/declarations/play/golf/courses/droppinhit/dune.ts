import { boosted, slab } from '@/declarations/play/golf/courses/build'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'

/**
 * La Dune: straight over the hump at speed, or the side lane with two plates
 * @return {GolfHoleLayout} - Hole
 */

export const duneHole = (): GolfHoleLayout => ({
  tee: [0, 1.5],
  cup: [0, 24],
  par: 3,
  pads: [
    slab(-1.5, 0, 3, 8, 0),
    slab(-1.5, 8, 3, 4, 0, 1.4),
    slab(-1.5, 12, 3, 2, 1.4),
    slab(-1.5, 14, 3, 4, 1.4, 0),
    slab(-1.5, 18, 3, 8, 0),
    slab(1.5, 0, 3, 3, 0),
    boosted(slab(1.5, 3, 3, 2.5, 0), [0, 1]),
    slab(1.5, 5.5, 3, 11, 0),
    boosted(slab(1.5, 16.5, 3, 2.5, 0), [-0.3, 1]),
    slab(1.5, 19, 3, 7, 0),
  ],
  orbs: [[0, 13]],
})
