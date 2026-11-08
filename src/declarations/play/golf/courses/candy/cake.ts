import { slab } from '@/declarations/play/golf/courses/build'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'
import { GolfSurfaces } from '@/utils/constants/play'

/**
 * Le Gâteau à étages: three tiers joined by side ramps, each with its own treat, the cup on the cherry
 * @return {GolfHoleLayout} - Hole
 */

export const cakeHole = (): GolfHoleLayout => ({
  tee: [4.5, 1.5],
  cup: [0, 25.5],
  par: 4,
  pads: [
    slab(-6, 0, 12, 8),
    slab(3.5, 8, 2.5, 4, 0, 1.2),
    slab(-6, 12, 12, 2.5, 1.2),
    slab(-6, 14.5, 5, 2, 1.2),
    slab(-1, 14.5, 2, 2, 1.2, 1.2, { surface: GolfSurfaces.Sand }),
    slab(1, 14.5, 5, 2, 1.2),
    slab(3.5, 18, 2.5, 4, 1.2, 2.4),
    slab(-6, 22, 12, 7, 2.4),
    slab(-6, 16.5, 12, 1.5, 1.2),
  ],
  bumpers: [
    { at: [-2, 4], radius: 0.4 },
    { at: [0, 6], radius: 0.4 },
  ],
  spinners: [{ at: [0, 13.2], length: 2.4, speed: 1.6 }],
  orbs: [
    [4.7, 10],
    [4.7, 20],
  ],
})
