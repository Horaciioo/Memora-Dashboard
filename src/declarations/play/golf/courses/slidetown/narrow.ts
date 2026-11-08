import { boosted, slab } from '@/declarations/play/golf/courses/build'
import { dropped, slideField } from '@/declarations/play/golf/courses/slidetown/field'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'

const SLOPE = 0.4
const TOP = 11

/**
 * Le Serré: a tube barely wider than a ball and a half, a plate in the middle, a scrum
 * @return {GolfHoleLayout} - Hole
 */

export const narrowHole = (): GolfHoleLayout => {
  const mid = dropped(TOP, 14, SLOPE)
  const foot = dropped(mid, 16, SLOPE)
  const field = slideField(33, foot)

  return {
    tee: [0, 1.5],
    cup: field.centre,
    cups: field.cups,
    pads: [
      slab(-0.7, 0, 1.4, 3, TOP),
      slab(-0.7, 3, 1.4, 11, TOP, dropped(TOP, 11, SLOPE)),
      boosted(slab(-0.7, 14, 1.4, 3, dropped(TOP, 11, SLOPE), dropped(TOP, 14, SLOPE)), [0, 1]),
      slab(-0.7, 17, 1.4, 16, mid, foot),
      ...field.pads,
    ],
    orbs: [[0, 9]],
  }
}
