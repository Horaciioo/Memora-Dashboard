import { slab, track } from '@/declarations/play/golf/courses/build'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'

/**
 * Les Chicanes: a zigzag of cushioned bends with a boost at each exit, and a narrow shortcut facing a fan
 * @return {GolfHoleLayout} - Hole
 */

export const chicanesHole = (): GolfHoleLayout => {
  const { pads, rails } = track(
    [
      [0, 1.2],
      [0, 7],
      [6, 7],
      [6, 13],
      [0, 13],
      [0, 19],
      [6, 19],
    ],
    2.4,
    [0, 0, 0, 0, 0, 0, 0],
    { plates: [1, 2, 3, 4, 5], plate: 2, bouncy: [1, 2, 3, 4, 5] }
  )

  return {
    tee: [0, 1.2],
    cup: [6, 19],
    par: 3,
    pads: [...pads, slab(2.4, 8.2, 1.2, 3.6)],
    rails,
    fans: [{ at: [2.4, 8.2], size: [1.2, 3.6], push: [0, -1] }],
    orbs: [[3, 10]],
  }
}
