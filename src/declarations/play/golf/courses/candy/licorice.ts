import { boosted, slab } from '@/declarations/play/golf/courses/build'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'

/**
 * Les Barres de réglisse: three bars reaching in turn from the walls, a boost, then the cup
 * @return {GolfHoleLayout} - Hole
 */

export const licoriceHole = (): GolfHoleLayout => ({
  tee: [0, 1.5],
  cup: [0, 22.5],
  par: 3,
  pads: [
    slab(-2, 0, 4, 2),
    boosted(slab(-2, 2, 4, 2), [0, 1]),
    slab(-2, 4, 4, 12),
    boosted(slab(-2, 16, 4, 2), [0, 1]),
    slab(-2, 18, 4, 6),
  ],
  blocks: [
    { at: [-2, 6], size: [2.7, 0.3] },
    { at: [-0.7, 10], size: [2.7, 0.3] },
    { at: [-2, 14], size: [2.7, 0.3] },
  ],
  orbs: [
    [0, 8],
    [0, 12],
  ],
})
