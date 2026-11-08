import { boosted, slab } from '@/declarations/play/golf/courses/build'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'

/**
 * Les Deux voies et le carré: a bare narrow lane straight at the hole, a safe lane with a plate
 * @return {GolfHoleLayout} - Hole
 */

export const forksHole = (): GolfHoleLayout => ({
  tee: [-3.4, 1.2],
  cup: [-3.4, 15],
  par: 3,
  pads: [
    slab(-4.6, 0, 9.2, 3, 0),
    slab(-4, 3, 1.2, 7, 0, 0, { open: 'ew' }),
    boosted(slab(2.4, 3, 2, 2.4, 0), [0, 1]),
    slab(2.4, 5.4, 2, 4.6, 0),
    slab(-8.4, 10, 12.8, 10, 0),
  ],
  orbs: [[-3.4, 7]],
})
