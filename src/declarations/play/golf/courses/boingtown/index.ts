import { angelHole } from '@/declarations/play/golf/courses/boingtown/angel'
import { bridgeHole } from '@/declarations/play/golf/courses/boingtown/bridge'
import { lanesHole } from '@/declarations/play/golf/courses/boingtown/lanes'
import { pegsHole } from '@/declarations/play/golf/courses/boingtown/pegs'
import { reboundsHole } from '@/declarations/play/golf/courses/boingtown/rebounds'
import { zigzagHole } from '@/declarations/play/golf/courses/boingtown/zigzag'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'

/**
 * BoingTown, six holes of ramps, voids and rebounds
 * @type {GolfHoleLayout[]}
 */

export const BOINGTOWN_HOLES: GolfHoleLayout[] = [
  pegsHole(),
  lanesHole(),
  angelHole(),
  zigzagHole(),
  reboundsHole(),
  bridgeHole(),
]
