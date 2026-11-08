import { bridgeHole } from '@/declarations/play/golf/courses/singletown/bridge'
import { forksHole } from '@/declarations/play/golf/courses/singletown/forks'
import { gulfHole } from '@/declarations/play/golf/courses/singletown/gulf'
import { islandHole } from '@/declarations/play/golf/courses/singletown/island'
import { snakeHole } from '@/declarations/play/golf/courses/singletown/snake'
import { wallsHole } from '@/declarations/play/golf/courses/singletown/walls'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'

/**
 * SingleTown, six holes of one decisive shot
 * @type {GolfHoleLayout[]}
 */

export const SINGLETOWN_HOLES: GolfHoleLayout[] = [
  gulfHole(),
  forksHole(),
  wallsHole(),
  snakeHole(),
  bridgeHole(),
  islandHole(),
]
