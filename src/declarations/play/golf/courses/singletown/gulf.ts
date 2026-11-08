import { boosted, slab } from '@/declarations/play/golf/courses/build'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'
import { GolfSurfaces } from '@/utils/constants/play'

// Gulf between the lip and the island of the hole
const GULF = 6

/**
 * La Ligne et le gouffre: a plate, a lip, six metres of void and the hole on a sand island
 * @return {GolfHoleLayout} - Hole
 */

export const gulfHole = (): GolfHoleLayout => ({
  tee: [0, 1.5],
  cup: [0, 20.7],
  par: 2,
  pads: [
    slab(-1.2, 0, 2.4, 5, 0),
    boosted(slab(-1.2, 5, 2.4, 2, 0), [0, 1]),
    slab(-1.2, 7, 2.4, 2, 0, 1, { open: 'n' }),
    slab(-1.5, 9 + GULF, 3, 6, 0, 0, { open: 's', surface: GolfSurfaces.Sand }),
  ],
  orbs: [[0, 3.5]],
})
