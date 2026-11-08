import { boosted, slab } from '@/declarations/play/golf/courses/build'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'

/**
 * Les Deux voies parallèles: two lanes, each a fan, a bumper and a boost chain feeding a cushioned square with the cup
 * @return {GolfHoleLayout} - Hole
 */

export const lanesHole = (): GolfHoleLayout => ({
  tee: [0, 1.5],
  cup: [0, 9.2],
  par: 3,
  pads: [
    slab(-5, 0, 10, 3),
    slab(-5, 3, 2.4, 11),
    slab(2.6, 3, 2.4, 11),
    boosted(slab(-2.6, 7.2, 1, 2), [1, 0]),
    boosted(slab(1.6, 7.2, 1, 2), [-1, 0]),
    slab(-1.6, 6, 3.2, 6, 0, 0, { bouncy: 'ns' }),
  ],
  fans: [
    { at: [-5, 3.2], size: [2.4, 2.6], push: [0, 1] },
    { at: [2.6, 3.2], size: [2.4, 2.6], push: [0, 1] },
  ],
  bumpers: [
    { at: [-3.8, 6.2], radius: 0.3 },
    { at: [3.8, 6.2], radius: 0.3 },
  ],
  orbs: [
    [-3.8, 11],
    [3.8, 11],
  ],
})
