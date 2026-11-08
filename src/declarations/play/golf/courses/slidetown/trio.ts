import { slab } from '@/declarations/play/golf/courses/build'
import { dropped, slideField, SLIDE_WIDTH } from '@/declarations/play/golf/courses/slidetown/field'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'

const SLOPE = 0.45
const TOP = 12

/**
 * Les Trois Toboggans: three tubes meeting round a mushroom, then the six holes
 * @return {GolfHoleLayout} - Hole
 */

export const trioHole = (): GolfHoleLayout => {
  const tube = dropped(TOP, 10, SLOPE)
  const join = dropped(tube, 4, SLOPE)
  const foot = dropped(join, 7, SLOPE)
  const field = slideField(24, foot)
  const half = SLIDE_WIDTH / 2

  return {
    tee: [0, 1.5],
    cup: field.centre,
    cups: field.cups,
    pads: [
      slab(-4.8, 0, 9.6, 3, TOP),
      ...[-3.6, 0, 3.6].map((x) => slab(x - 1.2, 3, 2.4, 10, TOP, tube)),
      slab(-4.8, 13, 9.6, 4, tube, join),
      slab(-half, 17, SLIDE_WIDTH, 7, join, foot),
      ...field.pads,
    ],
    bumpers: [{ at: [0, 15], radius: 0.5 }],
    orbs: [
      [-3.6, 8],
      [3.6, 8],
    ],
  }
}
