import { boosted, mirror, slab } from '@/declarations/play/golf/courses/build'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'

/**
 * Le Serpent: four elbows cut by mirrors, a plate on the long legs
 * @return {GolfHoleLayout} - Hole
 */

export const snakeHole = (): GolfHoleLayout => ({
  tee: [0, 1.5],
  cup: [-2.4, 27],
  par: 3,
  pads: [
    slab(-1.2, 0, 2.4, 3, 0),
    boosted(slab(-1.2, 3, 2.4, 2, 0), [0, 1]),
    slab(-1.2, 5, 2.4, 3.4, 0),
    slab(-1.2, 8.4, 2.4, 2.4, 0),
    boosted(slab(1.2, 8.4, 2, 2.4, 0), [1, 0]),
    slab(3.2, 8.4, 2.4, 2.4, 0),
    boosted(slab(3.2, 10.8, 2.4, 2, 0), [0, 1]),
    slab(3.2, 12.8, 2.4, 3, 0),
    slab(3.2, 15.8, 2.4, 2.4, 0),
    boosted(slab(0.2, 15.8, 3, 2.4, 0), [-1, 0]),
    slab(-1.2, 15.8, 1.4, 2.4, 0),
    slab(-3.6, 15.8, 2.4, 2.4, 0),
    boosted(slab(-3.6, 18.2, 2.4, 2, 0), [0, 1]),
    slab(-3.6, 20.2, 2.4, 8, 0),
  ],
  rails: [
    mirror([0, 9.6], 1.2, 1, 1),
    mirror([4.4, 9.6], 1.2, 1, -1),
    mirror([4.4, 17], 1.2, -1, 1),
    mirror([-2.4, 17], 1.2, -1, -1),
  ],
  orbs: [[4.4, 13]],
})
