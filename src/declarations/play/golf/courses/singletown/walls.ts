import { slab } from '@/declarations/play/golf/courses/build'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'

/**
 * Les Deux murs: a thin wall open on the right, a row of bumpers open on the left
 * @return {GolfHoleLayout} - Hole
 */

export const wallsHole = (): GolfHoleLayout => ({
  tee: [1.2, 1.5],
  cup: [0, 21],
  par: 3,
  pads: [slab(-2.1, 0, 4.2, 23, 0)],
  blocks: [{ at: [-2.1, 8], size: [2.6, 0.3] }],
  bumpers: [0, 0.7, 1.4, 2.1].map((x) => ({ at: [x, 14.5] as [number, number], radius: 0.35 })),
  orbs: [[-1.2, 11]],
})
