import { boosted, slab } from '@/declarations/play/golf/courses/build'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'

/**
 * Le Vent de face: a plate to break through the gale, the hole just before the void
 * @return {GolfHoleLayout} - Hole
 */

export const headwindHole = (): GolfHoleLayout => ({
  tee: [0, 1.5],
  cup: [0, 19],
  par: 2,
  pads: [
    slab(-1.5, 0, 3, 3, 0),
    boosted(slab(-1.5, 3, 3, 3, 0), [0, 1]),
    slab(-1.5, 6, 3, 15, 0, 0, { open: 'n' }),
  ],
  fans: [{ at: [-1.5, 9], size: [3, 2.5], push: [0, -1] }],
  orbs: [[0, 6.5]],
})
