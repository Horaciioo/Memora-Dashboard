import { track } from '@/declarations/play/golf/courses/build'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'

/**
 * Le Colimaçon: a spiral climbing 3.6 m, a boost on each turn and a fan before the cup
 * @return {GolfHoleLayout} - Hole
 */

export const snailHole = (): GolfHoleLayout => {
  const { pads, rails } = track(
    [
      [1.2, 1.2],
      [9.6, 1.2],
      [9.6, 9.6],
      [1.2, 9.6],
      [1.2, 5.4],
      [6.6, 5.4],
    ],
    2.4,
    [0, 0, 1.8, 1.8, 3.6, 3.6],
    { plates: [1, 2, 3], plate: 2, bouncy: [2, 4] }
  )

  return {
    tee: [1.2, 1.2],
    cup: [6.6, 5.4],
    par: 4,
    pads,
    rails,
    fans: [{ at: [3.6, 4.2], size: [2.4, 2.4], push: [1, 0] }],
    orbs: [
      [9.6, 5.4],
      [5.4, 9.6],
    ],
  }
}
