import { slab } from '@/declarations/play/golf/courses/build'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'

/**
 * Les Jumeaux: a cross with three rings, two lead to islands that send the ball back, one to the cup
 * @return {GolfHoleLayout} - Hole
 */

export const twinsHole = (): GolfHoleLayout => ({
  tee: [0, 0],
  cup: [-5.8, 0],
  par: 2,
  pads: [
    slab(-1.5, -1.5, 3, 3),
    slab(-1.5, 1.5, 3, 5.5),
    slab(1.5, -1.5, 5.5, 3),
    slab(-1.5, -7, 3, 5.5),
    slab(-7, -1.5, 5.5, 3),
    slab(9, 6, 4, 4),
    slab(9, -10, 4, 4),
  ],
  portals: [
    { from: [0, 6], to: [10, 8], heading: Math.PI / 2 },
    { from: [12, 8], to: [0, 0.8] },
    { from: [6, 0], to: [10, -8], heading: Math.PI / 2 },
    { from: [12, -8], to: [0, -0.8] },
    { from: [0, -6], to: [-4.4, 0], heading: -Math.PI / 2 },
  ],
  orbs: [
    [3.5, 0],
    [0, 3.5],
  ],
})
