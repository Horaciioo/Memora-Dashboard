import { boosted, slab } from '@/declarations/play/golf/courses/build'
import { dropped, slideField } from '@/declarations/play/golf/courses/slidetown/field'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'

const SLOPE = 0.4
const TOP = 14

/**
 * Le Toboggan à bumpers: one long tube, plates, posts and a bumper chicane
 * @return {GolfHoleLayout} - Hole
 */

export const bumpersHole = (): GolfHoleLayout => {
  const tube = dropped(TOP, 33, SLOPE)
  const field = slideField(36, tube)

  return {
    tee: [0, 1.5],
    cup: field.centre,
    cups: field.cups,
    pads: [
      slab(-1.8, 0, 3.6, 3, TOP),
      slab(-1.8, 3, 3.6, 8, TOP, dropped(TOP, 8, SLOPE)),
      boosted(slab(-1.8, 11, 3.6, 2, dropped(TOP, 8, SLOPE), dropped(TOP, 10, SLOPE)), [0, 1]),
      slab(-1.8, 13, 3.6, 12, dropped(TOP, 10, SLOPE), dropped(TOP, 22, SLOPE)),
      boosted(slab(-1.8, 25, 3.6, 2, dropped(TOP, 22, SLOPE), dropped(TOP, 24, SLOPE)), [0, 1]),
      slab(-1.8, 27, 3.6, 9, dropped(TOP, 24, SLOPE), tube),
      ...field.pads,
    ],
    bumpers: [
      { at: [-0.8, 7], radius: 0.4 },
      { at: [0.8, 16], radius: 0.4 },
      { at: [-0.8, 19], radius: 0.4 },
      { at: [0.8, 22], radius: 0.4 },
    ],
    blocks: [
      { at: [-1.8, 30], size: [1.4, 0.3] },
      { at: [0.4, 33], size: [1.4, 0.3] },
    ],
    orbs: [[0, 15]],
  }
}
