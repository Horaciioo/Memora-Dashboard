import { slab } from '@/declarations/play/golf/courses/build'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'
import { GolfSurfaces } from '@/utils/constants/play'

/**
 * Le Glaçage: ten metres of ice ending on three marshmallows round the cup
 * @return {GolfHoleLayout} - Hole
 */

export const glazeHole = (): GolfHoleLayout => ({
  tee: [0, 1.5],
  cup: [0, 17],
  par: 3,
  pads: [
    slab(-2, 0, 4, 4),
    slab(-2, 4, 4, 10, 0, 0, { surface: GolfSurfaces.Ice }),
    slab(-3, 14, 6, 5),
  ],
  bumpers: [
    { at: [-1.4, 17], radius: 0.4 },
    { at: [1.4, 17], radius: 0.4 },
    { at: [0, 18.3], radius: 0.4 },
  ],
  orbs: [
    [0, 9],
    [0, 15],
  ],
})
