import { slab } from '@/declarations/play/golf/courses/build'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'

/**
 * Le Vent de dos: a fan carries the ball, a bumper waits for the ones that run
 * @return {GolfHoleLayout} - Hole
 */

export const tailwindHole = (): GolfHoleLayout => ({
  tee: [0, 1.5],
  cup: [0, 22],
  par: 2,
  pads: [slab(-1.5, 0, 3, 25, 0)],
  fans: [{ at: [-1.5, 5], size: [3, 6], push: [0, 1] }],
  bumpers: [{ at: [0.3, 17], radius: 0.4 }],
  orbs: [[0, 9]],
})
