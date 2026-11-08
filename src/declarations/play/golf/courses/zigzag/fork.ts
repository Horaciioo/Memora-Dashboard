import { slab } from '@/declarations/play/golf/courses/build'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'
import { GolfSurfaces } from '@/utils/constants/play'

/**
 * La Fourche des portails: three rings, a bumper strip, a slope and a sand fan, all ending on one platform
 * @return {GolfHoleLayout} - Hole
 */

export const forkHole = (): GolfHoleLayout => ({
  tee: [0, 1.5],
  cup: [0, 21],
  par: 3,
  pads: [
    slab(-5, 0, 10, 6),
    slab(-9, 10, 5, 6),
    slab(-2.5, 10, 5, 6, 0.6, 0),
    slab(4, 10, 5, 6, 0, 0, { surface: GolfSurfaces.Sand }),
    slab(-9, 16, 18, 8),
  ],
  portals: [
    { from: [-3, 5], to: [-6.5, 11], heading: 0 },
    { from: [0, 5], to: [0, 11], heading: 0 },
    { from: [3, 5], to: [6.5, 11], heading: 0 },
  ],
  bumpers: [
    { at: [-7.6, 13.4], radius: 0.35 },
    { at: [-5.4, 13.4], radius: 0.35 },
  ],
  fans: [{ at: [4, 10], size: [5, 6], push: [0, 1] }],
  orbs: [
    [-6.5, 14.5],
    [6.5, 14.5],
  ],
})
