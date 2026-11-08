import { boosted, slab } from '@/declarations/play/golf/courses/build'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'

/**
 * La Montée et la descente: a hill and a dip, each with a plate and a bumper, one plaza
 * @return {GolfHoleLayout} - Hole
 */

export const hillHole = (): GolfHoleLayout => {
  const path = (x: number, height: number) => [
    boosted(slab(x, 3, 3.2, 2, 0), [0, 1]),
    slab(x, 5, 3.2, 6, 0, height),
    slab(x, 11, 3.2, 3, height),
    slab(x, 14, 3.2, 6, height, 0),
  ]

  return {
    tee: [0, 1.5],
    cup: [0, 24],
    par: 3,
    pads: [slab(-4, 0, 8, 3, 0), ...path(-4, 1.8), ...path(0.8, -1.8), slab(-6, 20, 12, 8, 0)],
    bumpers: [
      { at: [-2.4, 8], radius: 0.35 },
      { at: [2.4, 8], radius: 0.35 },
    ],
    orbs: [
      [-2.4, 12],
      [2.4, 12],
    ],
  }
}
