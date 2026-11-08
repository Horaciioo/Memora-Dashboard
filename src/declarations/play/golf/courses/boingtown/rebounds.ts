import { slab } from '@/declarations/play/golf/courses/build'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'

/**
 * Les Trois Rebonds: three ramps of different reach over a void, a side road round it, glass behind the cup
 * @return {GolfHoleLayout} - Hole
 */

export const reboundsHole = (): GolfHoleLayout => ({
  tee: [0, 1.5],
  cup: [0, 15],
  par: 3,
  pads: [
    slab(-6, 0, 12, 3.5),
    slab(-5.5, 3.5, 2, 2.5, 0, 0.5, { open: 'n' }),
    slab(-1, 3.5, 2, 2.5, 0, 0.8, { open: 'n' }),
    slab(3.5, 3.5, 2, 2.5, 0, 1.1, { open: 'n' }),
    slab(-6, 3.5, 0.5, 2.5),
    slab(-3.5, 3.5, 2.5, 2.5),
    slab(1, 3.5, 2.5, 2.5),
    slab(5.5, 3.5, 0.5, 2.5),
    slab(-9.5, 0, 3.5, 10.8),
    slab(-9.5, 10.8, 15.5, 8, 0, 0, { glass: 'n' }),
  ],
  orbs: [
    [-8, 8],
    [0, 4],
  ],
})
