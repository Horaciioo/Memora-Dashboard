import { slab } from '@/declarations/play/golf/courses/build'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'

// Seconds of a whole turn of the wind
const TURN = 8

/**
 * Four fans lit one after the other round the hole, clockwise
 * @param {number} index - Order in the turn
 * @return {{ period: number, phase: number }} - Cycle
 */

const cycle = (index: number) => ({ period: TURN, phase: (-2 * Math.PI * index) / 4 })

/**
 * Les Girouettes: a wind clock, the right moment lets a fan push the ball home
 * @return {GolfHoleLayout} - Hole
 */

export const vanesHole = (): GolfHoleLayout => ({
  tee: [0, 1.2],
  cup: [0, 7],
  par: 2,
  pads: [slab(-7, 0, 14, 14, 0)],
  fans: [
    { at: [-1.5, 2.6], size: [3, 2], push: [0, 1], cycle: cycle(0) },
    { at: [-7, 5.5], size: [2.5, 3], push: [1, 0], cycle: cycle(1) },
    { at: [-1.5, 9.4], size: [3, 2], push: [0, -1], cycle: cycle(2) },
    { at: [4.5, 5.5], size: [2.5, 3], push: [-1, 0], cycle: cycle(3) },
  ],
  orbs: [
    [-4, 3],
    [4, 3],
  ],
})
