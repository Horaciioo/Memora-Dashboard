import { boosted, slab } from '@/declarations/play/golf/courses/build'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'

/**
 * Le Pont brisé: three planks hopped one after the other over voids of 2, 3 and 4 metres
 * @return {GolfHoleLayout} - Hole
 */

export const bridgeHole = (): GolfHoleLayout => ({
  tee: [0, 1.5],
  cup: [0, 37],
  par: 3,
  pads: [
    slab(-1.2, 0, 2.4, 4, 0),
    boosted(slab(-1.2, 4, 2.4, 2, 0), [0, 1]),
    slab(-1.2, 6, 2.4, 2, 0, 0.8, { open: 'n' }),
    slab(-1.2, 10, 2.4, 3, 0, 0, { open: 's' }),
    boosted(slab(-1.2, 13, 2.4, 2, 0), [0, 1]),
    slab(-1.2, 15, 2.4, 2, 0, 0.8, { open: 'n' }),
    slab(-1.2, 20, 2.4, 4, 0, 0, { open: 's' }),
    slab(-1.2, 24, 2.4, 2, 0, 0.8, { open: 'n' }),
    slab(-1.2, 30, 2.4, 8, 0, 0, { open: 's' }),
  ],
  orbs: [[0, 7]],
})
