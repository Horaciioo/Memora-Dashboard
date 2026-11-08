import { slab, slabX } from '@/declarations/play/golf/courses/build'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'

/**
 * Le Saut de l'ange: a ramp over a 5 m void to a lower platform, or the slow path round the side
 * @return {GolfHoleLayout} - Hole
 */

export const angelHole = (): GolfHoleLayout => ({
  tee: [0, 1.5],
  cup: [0, 14],
  par: 3,
  pads: [
    slab(-3, 0, 6, 3.5, 1.2),
    slab(-1.5, 3.5, 3, 2.5, 1.2, 1.7, { open: 'n' }),
    slab(-3, 3.5, 1.5, 2.5, 1.2),
    slab(1.5, 3.5, 1.5, 2.5, 1.2),
    slabX(3, 0, 3, 6, 1.2),
    slab(3, 6, 3, 4, 1.2, 0, { open: '' }),
    slab(-3, 11, 9, 6),
  ],
  fans: [{ at: [3, 2], size: [3, 4], push: [0, 1] }],
  bumpers: [{ at: [4.5, 1.2], radius: 0.3 }],
  orbs: [
    [0, 12.5],
    [4.5, 8],
  ],
})
