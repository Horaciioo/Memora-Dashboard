import { boosted, slab } from '@/declarations/play/golf/courses/build'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'

/**
 * L'Ile: two launch lanes at a right angle to each other over a ring of void, the hole on a rimmed island
 * @return {GolfHoleLayout} - Hole
 */

export const islandHole = (): GolfHoleLayout => ({
  tee: [-3.6, 1.5],
  cup: [0, 17],
  par: 2,
  pads: [
    slab(-5, 0, 10, 3, 0),
    boosted(slab(-4.4, 3, 1.6, 2, 0), [0, 1]),
    slab(-4.4, 5, 1.6, 2, 0, 1, { open: 'n' }),
    boosted(slab(2.8, 3, 1.6, 2, 0), [-0.3, 1]),
    slab(2.8, 5, 1.6, 2, 0, 1, { open: 'n' }),
    slab(-3.5, 14, 7, 6, 0, 0, { open: 's' }),
  ],
  orbs: [[-3.6, 4]],
})
