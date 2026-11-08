import { slabX, track } from '@/declarations/play/golf/courses/build'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'

/**
 * Zigzag ou raccourci: four stepped branches with cushioned bends, or a big ramp over the void to the high platform
 * @return {GolfHoleLayout} - Hole
 */

export const zigzagHole = (): GolfHoleLayout => {
  const { pads, rails } = track(
    [
      [0, 1.2],
      [0, 7],
      [7, 7],
      [7, 13],
      [1.2, 13],
    ],
    2.4,
    [0, 0.4, 0.8, 1.2, 1.2],
    { bouncy: [1, 2, 3], plates: [1, 2, 3], plate: 2 }
  )

  return {
    tee: [0, 1.2],
    cup: [2.4, 13],
    par: 3,
    pads: [...pads, slabX(1.2, 0, 2.4, 2.4, 0, 0.8, { open: 'e' })],
    rails,
    orbs: [
      [3.5, 7],
      [7, 10],
    ],
  }
}
