import { boosted, slab } from '@/declarations/play/golf/courses/build'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'

/**
 * Le Pont suspendu: a lane that climbs and a lane that dives round a void, meeting on a cushioned square
 * @return {GolfHoleLayout} - Hole
 */

export const bridgeHole = (): GolfHoleLayout => ({
  tee: [0, 1.5],
  cup: [0, 17.5],
  par: 3,
  pads: [
    slab(-5.5, 0, 11, 3),
    boosted(slab(-5.5, 3, 3.5, 2, 0, 0.5), [0, 1]),
    slab(-5.5, 5, 3.5, 2, 0.5, 1),
    boosted(slab(-5.5, 7, 3.5, 3, 1), [0, 1]),
    slab(-5.5, 10, 3.5, 5, 1, 0),
    slab(2, 3, 3.5, 4, 0, -1),
    boosted(slab(2, 7, 3.5, 3, -1), [0, 1]),
    slab(2, 10, 3.5, 5, -1, 0),
    slab(-5.5, 15, 11, 5, 0, 0, { bouncy: 'we' }),
  ],
  orbs: [
    [-3.7, 8.5],
    [3.7, 8.5],
  ],
})
