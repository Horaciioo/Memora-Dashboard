import { track } from '@/declarations/play/golf/courses/build'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'

/**
 * Le Bâton de sucre: a long L with a candy cane across the bend and a cushioned corner for the bold
 * @return {GolfHoleLayout} - Hole
 */

export const stickHole = (): GolfHoleLayout => {
  const { pads, rails } = track(
    [
      [0, 1.3],
      [0, 13.3],
      [10, 13.3],
    ],
    2.6,
    [0, 0, 0],
    { bouncy: [1], plates: [0, 1], plate: 2 }
  )

  return {
    tee: [0, 1.3],
    cup: [9, 13.3],
    par: 3,
    pads,
    rails,
    blocks: [{ at: [-0.1, 8.6], size: [1.4, 0.25] }],
    orbs: [
      [0, 5],
      [5, 13.3],
    ],
  }
}
