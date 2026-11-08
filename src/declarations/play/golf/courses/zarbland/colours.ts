import { boosted, slab } from '@/declarations/play/golf/courses/build'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'

/**
 * Les Deux couleurs: a red lane with a bumper, a blue lane with a plate, one fan behind the hole
 * @return {GolfHoleLayout} - Hole
 */

export const coloursHole = (): GolfHoleLayout => ({
  tee: [1.8, 1.5],
  cup: [1.8, 16],
  par: 3,
  pads: [
    slab(-3, 0, 6, 3, 0),
    slab(-3, 3, 2.4, 8, 0),
    boosted(slab(0.6, 3, 2.4, 8, 0), [0, 1]),
    slab(-3, 11, 6, 9, 0),
  ],
  bumpers: [{ at: [-1.8, 7], radius: 0.4 }],
  fans: [{ at: [-3, 17], size: [6, 1], push: [0, -1] }],
  orbs: [[1.8, 8]],
})
