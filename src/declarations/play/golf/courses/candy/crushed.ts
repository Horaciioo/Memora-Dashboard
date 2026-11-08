import { slab } from '@/declarations/play/golf/courses/build'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'
import { GolfSurfaces } from '@/utils/constants/play'

const sand = { surface: GolfSurfaces.Sand }

/**
 * La Montagne de glace pilée: a hill with a spinner on top, ringed by icing sugar
 * @return {GolfHoleLayout} - Hole
 */

export const crushedHole = (): GolfHoleLayout => ({
  tee: [0, 1.5],
  cup: [0, 19.5],
  par: 3,
  pads: [
    slab(-6.5, 0, 13, 3),
    slab(-6.5, 3, 4, 14, 0, 0, sand),
    slab(-2.5, 3, 5, 5.3, 0, 1.6),
    slab(-2.5, 8.3, 5, 2.7, 1.6),
    slab(-2.5, 11, 5, 6, 1.6, 0),
    slab(2.5, 3, 4, 14, 0, 0, sand),
    slab(-6.5, 17, 13, 5),
  ],
  spinners: [{ at: [0, 9.6], length: 1.8, speed: 1.4 }],
  orbs: [
    [0, 6],
    [-4.5, 10],
  ],
})
