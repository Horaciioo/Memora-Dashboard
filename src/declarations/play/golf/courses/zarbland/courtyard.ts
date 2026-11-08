import { slab } from '@/declarations/play/golf/courses/build'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'

/**
 * Le Cour des quatre vents: four fans push a ball to the middle where the hole waits
 * @return {GolfHoleLayout} - Hole
 */

export const courtyardHole = (): GolfHoleLayout => ({
  tee: [0, 1.5],
  cup: [0, 11],
  par: 2,
  pads: [slab(-1.2, 0, 2.4, 8, 0), slab(-3, 8, 6, 6, 0)],
  fans: [
    { at: [-3, 8], size: [1.5, 6], push: [1, 0] },
    { at: [1.5, 8], size: [1.5, 6], push: [-1, 0] },
    { at: [-1.5, 8], size: [3, 1.5], push: [0, 1] },
    { at: [-1.5, 12.5], size: [3, 1.5], push: [0, -1] },
  ],
  orbs: [[0, 5]],
})
