import { track } from '@/declarations/play/golf/courses/build'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'

/**
 * La Spirale carrée: a square spiral, a boost on every exit and cushions in two corners
 * @return {GolfHoleLayout} - Hole
 */

export const spiralHole = (): GolfHoleLayout => {
  const { pads, rails } = track(
    [
      [1.2, 1.2],
      [10.8, 1.2],
      [10.8, 10.8],
      [1.2, 10.8],
      [1.2, 4.8],
      [7.2, 4.8],
    ],
    2.4,
    [0, 0, 0, 0, 0, 0],
    { plates: [1, 2, 3], plate: 2, bouncy: [2, 4] }
  )

  return {
    tee: [1.2, 1.2],
    cup: [7.2, 4.8],
    par: 3,
    pads,
    rails,
    orbs: [
      [10.8, 6],
      [6, 10.8],
    ],
  }
}
