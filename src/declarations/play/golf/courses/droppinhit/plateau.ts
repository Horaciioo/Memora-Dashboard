import { slab } from '@/declarations/play/golf/courses/build'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'
import { GolfSurfaces } from '@/utils/constants/play'

/**
 * La Pente et le plateau: up a long ramp, across a sand pit, then down to the hole
 * @return {GolfHoleLayout} - Hole
 */

export const plateauHole = (): GolfHoleLayout => ({
  tee: [0, 1.5],
  cup: [0, 26],
  par: 3,
  pads: [
    slab(-1.5, 0, 3, 3, 0),
    slab(-1.5, 3, 3, 8, 0, 1.6),
    slab(-1.5, 11, 3, 3, 1.6),
    slab(-1.5, 14, 3, 3, 1.6, 1.6, { surface: GolfSurfaces.Sand }),
    slab(-1.5, 17, 3, 3, 1.6),
    slab(-1.5, 20, 3, 4, 1.6, 0),
    slab(-1.5, 24, 3, 4, 0),
  ],
  orbs: [[0, 9]],
})
