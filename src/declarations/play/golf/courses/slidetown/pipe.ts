import { slab } from '@/declarations/play/golf/courses/build'
import { SLIDE_WIDTH, slideField } from '@/declarations/play/golf/courses/slidetown/field'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'

// Height of the south lip, of the far wall
const LIP = 2.8
const WALL = 2.2

/**
 * Le Half-Pipe: a plunge, a swing up the far wall and back over the six holes
 * @return {GolfHoleLayout} - Hole
 */

export const pipeHole = (): GolfHoleLayout => {
  const field = slideField(9, 0)
  const half = SLIDE_WIDTH / 2

  return {
    tee: [0, 1.5],
    cup: field.centre,
    cups: field.cups,
    pads: [
      slab(-half, 0, SLIDE_WIDTH, 3, LIP),
      slab(-half, 3, SLIDE_WIDTH, 6, LIP, 0),
      ...field.pads,
      slab(-half, 9 + 3.6, SLIDE_WIDTH, 5, 0, WALL),
    ],
    orbs: [
      [-3.6, 6],
      [3.6, 6],
    ],
  }
}
