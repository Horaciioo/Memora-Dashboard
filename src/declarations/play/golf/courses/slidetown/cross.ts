import { boosted, slab } from '@/declarations/play/golf/courses/build'
import { dropped, slideField } from '@/declarations/play/golf/courses/slidetown/field'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'

const SLOPE = 0.45
const TOP = 12

/**
 * ZigzagLand: two tubes swapping sides on a crossing, then the six holes
 * @return {GolfHoleLayout} - Hole
 */

export const crossHole = (): GolfHoleLayout => {
  const cross = dropped(TOP, 10, SLOPE)
  const out = dropped(cross, 3, SLOPE)
  const foot = dropped(out, 10, SLOPE)
  const field = slideField(23, foot)

  return {
    tee: [-2.4, 1.5],
    cup: field.centre,
    cups: field.cups,
    pads: [
      slab(-4.8, 0, 9.6, 3, TOP),
      slab(-4.8, 3, 2.4, 10, TOP, cross),
      slab(2.4, 3, 2.4, 10, TOP, cross),
      boosted(slab(-4.8, 13, 2.4, 3, cross, out), [0.7, 1]),
      boosted(slab(2.4, 13, 2.4, 3, cross, out), [-0.7, 1]),
      slab(-2.4, 13, 4.8, 3, cross, out),
      slab(-4.8, 16, 2.4, 7, out, foot),
      slab(2.4, 16, 2.4, 7, out, foot),
      slab(-2.4, 16, 4.8, 7, out, foot),
      ...field.pads,
    ],
    orbs: [[2.4, 8]],
  }
}
