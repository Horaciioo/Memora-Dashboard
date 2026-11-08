import { boosted, slab } from '@/declarations/play/golf/courses/build'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'

/**
 * La Pente à deux flancs: two lanes with a fan, a propelled ramp, a plateau and a cushion corner
 * @return {GolfHoleLayout} - Hole
 */

export const flanksHole = (): GolfHoleLayout => ({
  tee: [-3.6, 1.5],
  cup: [-2.5, 20],
  par: 3,
  pads: [
    slab(-5, 0, 10, 3, 0),
    slab(-5, 3, 2.8, 8, 0),
    slab(2.2, 3, 2.8, 8, 0),
    boosted(slab(-5, 11, 10, 4, 0, 1.6), [0, 1]),
    slab(-5, 15, 10, 8, 1.6, 1.6, { bouncy: 'n' }),
  ],
  fans: [
    { at: [-5, 6], size: [2.8, 2], push: [1, 0.3] },
    { at: [2.2, 6], size: [2.8, 2], push: [-1, 0.3] },
  ],
  orbs: [[-3.6, 8]],
})
