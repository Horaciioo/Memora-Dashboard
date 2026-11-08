import { slab } from '@/declarations/play/golf/courses/build'
import { cupField } from '@/declarations/play/golf/courses/randomtown/field'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'

/**
 * La Descente aux aveugles: the floor vanishes halfway, hiding bumpers and walls
 * @return {GolfHoleLayout} - Hole
 */

export const blindHole = (): GolfHoleLayout => {
  const field = cupField(17)

  return {
    tee: [0, 1.2],
    cup: field.centre,
    cups: field.cups,
    rails: field.rails,
    pads: [
      slab(-3.5, 0, 7, 6, 3.4, 2.2),
      slab(-4.5, 6, 9, 11, 2.2, 0, { hidden: true }),
      ...field.pads,
    ],
    bumpers: [
      { at: [-2, 3], radius: 0.35 },
      { at: [1.5, 4.2], radius: 0.35 },
      { at: [-0.5, 8], radius: 0.4, isHidden: true },
      { at: [2.2, 10], radius: 0.4, isHidden: true },
      { at: [-2.4, 11.4], radius: 0.4, isHidden: true },
      { at: [0.2, 13.8], radius: 0.4, isHidden: true },
    ],
    blocks: [
      { at: [-0.6, 5], size: [0.25, 1.4] },
      { at: [-2.6, 7.2], size: [1.3, 0.25], isHidden: true },
      { at: [1.4, 12], size: [1.3, 0.25], isHidden: true },
      { at: [-1.5, 15], size: [0.25, 1.2], isHidden: true },
    ],
    orbs: [[0, 9.5]],
  }
}
