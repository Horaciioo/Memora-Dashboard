import { boosted, slab } from '@/declarations/play/golf/courses/build'
import { cupField } from '@/declarations/play/golf/courses/randomtown/field'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'
import { GolfSurfaces } from '@/utils/constants/play'

/**
 * Les Terrasses: three stepped terraces, a spinner, outward plates and sand, then the five holes
 * @return {GolfHoleLayout} - Hole
 */

export const terracesHole = (): GolfHoleLayout => {
  const field = cupField(20)
  const side = 1.5

  return {
    tee: [0, 1.2],
    cup: field.centre,
    cups: field.cups,
    pads: [
      slab(-4.5, 0, 9, 7, 2.4),
      slab(-4.5, 7, 9, 3, 2.4, 1.2),
      boosted(slab(-4.5, 10, side, 7, 1.2), [-0.35, 1]),
      slab(-4.5 + side, 10, side, 7, 1.2),
      slab(-1.5, 10, 3, 7, 1.2, 1.2, { surface: GolfSurfaces.Sand }),
      slab(1.5, 10, side, 7, 1.2),
      boosted(slab(3, 10, side, 7, 1.2), [0.35, 1]),
      slab(-4.5, 17, 9, 3, 1.2, 0),
      ...field.pads,
    ],
    spinners: [{ at: [0, 4.2], length: 3.4, speed: 1.6 }],
    orbs: [
      [-3.6, 5],
      [3.6, 14],
    ],
  }
}
