import { slab } from '@/declarations/play/golf/courses/build'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'

/**
 * Le Labyrinthe de miroirs: four cells, a ring in each sending the ball clockwise to the next
 * @return {GolfHoleLayout} - Hole
 */

export const mirrorsHole = (): GolfHoleLayout => ({
  tee: [1.5, 1.5],
  cup: [8.5, 1.8],
  par: 2,
  pads: [
    slab(0, 0, 5.5, 5.5),
    slab(0, 6.5, 5.5, 5.5),
    slab(6.5, 6.5, 5.5, 5.5),
    slab(6.5, 0, 5.5, 5.5),
  ],
  portals: [
    { from: [4.2, 4.2], to: [1.3, 7.8], heading: Math.PI / 4 },
    { from: [4.2, 10.7], to: [7.8, 10.7], heading: (3 * Math.PI) / 4 },
    { from: [10.7, 7.8], to: [10.7, 4.4], heading: -2.44 },
  ],
  bumpers: [{ at: [8.5, 8.7], radius: 0.35 }],
  orbs: [
    [2.8, 9.2],
    [9.2, 5],
  ],
})
