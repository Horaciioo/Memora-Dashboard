import { boosted, slab } from '@/declarations/play/golf/courses/build'
import { dropped, slideField } from '@/declarations/play/golf/courses/slidetown/field'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'

const SLOPE = 0.4
const TOP = 8

/**
 * Le Looping: a drop, three plates, then a steep curl taken fast or rolled back
 * @return {GolfHoleLayout} - Hole
 */

export const loopHole = (): GolfHoleLayout => {
  const base = dropped(TOP, 12, SLOPE)
  const exit = base + 0.8
  const field = slideField(25, exit - 8 * SLOPE)

  return {
    tee: [0, 1.5],
    cup: field.centre,
    cups: field.cups,
    pads: [
      slab(-1.5, 0, 3, 3, TOP),
      slab(-1.5, 3, 3, 9, TOP, base),
      boosted(slab(-1.5, 12, 3, 2, base), [0, 1]),
      boosted(slab(-1.5, 14, 3, 2.2, base), [0, 1]),
      slab(-1.5, 16.2, 3, 2.4, base, exit),
      slab(-1.5, 18.6, 3, 1.4, exit, exit - 1.4 * SLOPE),
      slab(-5.4, 20, 10.8, 5, exit - 1.4 * SLOPE, exit - 8 * SLOPE),
      ...field.pads,
    ],
    orbs: [[0, 6]],
  }
}
