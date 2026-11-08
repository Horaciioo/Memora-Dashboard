import { slab } from '@/declarations/play/golf/courses/build'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'

/**
 * Le Trou noir: a vortex bending the shot, two rings beside it throwing the ball across to the cup
 * @return {GolfHoleLayout} - Hole
 */

export const blackholeHole = (): GolfHoleLayout => ({
  tee: [0, 1.5],
  cup: [0, 14.5],
  par: 3,
  pads: [slab(-7, 0, 14, 17)],
  vortexes: [{ at: [0, 8.5], radius: 2.4 }],
  portals: [
    { from: [-3.4, 8.5], to: [3.4, 12], heading: 0 },
    { from: [3.4, 8.5], to: [-3.4, 12], heading: 0 },
  ],
  orbs: [
    [-5, 5],
    [5, 5],
  ],
})
