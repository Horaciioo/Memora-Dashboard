import { slab } from '@/declarations/play/golf/courses/build'
import { GolfSurfaces } from '@/utils/constants/play'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'

/**
 * Les Deux mondes: a lane and a hidden alcove lead by rings to a platform two metres up
 * @return {GolfHoleLayout} - Hole
 */

export const worldsHole = (): GolfHoleLayout => ({
  tee: [0, 1.5],
  cup: [11.5, 14],
  par: 3,
  pads: [
    slab(-1.5, 0, 3, 16),
    slab(-6, 8, 4.5, 4),
    slab(6, 10, 3, 8, 2),
    slab(9, 10, 2, 8, 2, 2, { surface: GolfSurfaces.Sand }),
    slab(11, 10, 4, 8, 2),
  ],
  blocks: [
    { at: [-4.2, 8.8], size: [0.25, 1.6] },
    { at: [-2.8, 10.4], size: [1.4, 0.25] },
  ],
  fans: [{ at: [7, 10], size: [2.5, 8], push: [1, 0] }],
  portals: [
    { from: [0, 14.5], to: [7, 14], heading: Math.PI / 2 },
    { from: [-5.2, 10], to: [7, 11.5], heading: Math.PI / 2 },
  ],
  orbs: [
    [0, 6],
    [10.5, 14],
  ],
})
