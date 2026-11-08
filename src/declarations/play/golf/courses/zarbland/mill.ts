import { slab } from '@/declarations/play/golf/courses/build'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'

/**
 * Le Moulin: a great bar turning across the lane, a fan on each side bringing the ball back to the middle
 * @return {GolfHoleLayout} - Hole
 */

export const millHole = (): GolfHoleLayout => ({
  tee: [0, 1.5],
  cup: [0, 19],
  par: 3,
  pads: [slab(-3, 0, 6, 22, 0)],
  spinners: [{ at: [0, 11], length: 5.6, speed: 1.2 }],
  fans: [
    { at: [-3, 8], size: [1.5, 6], push: [1, 0] },
    { at: [1.5, 8], size: [1.5, 6], push: [-1, 0] },
  ],
  orbs: [
    [-2, 6],
    [2, 6],
  ],
})
