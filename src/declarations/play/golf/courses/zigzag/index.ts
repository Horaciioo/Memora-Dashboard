import { blackholeHole } from '@/declarations/play/golf/courses/zigzag/blackhole'
import { diagonalHole } from '@/declarations/play/golf/courses/zigzag/diagonal'
import { forkHole } from '@/declarations/play/golf/courses/zigzag/fork'
import { mirrorsHole } from '@/declarations/play/golf/courses/zigzag/mirrors'
import { twinsHole } from '@/declarations/play/golf/courses/zigzag/twins'
import { worldsHole } from '@/declarations/play/golf/courses/zigzag/worlds'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'

/**
 * ZigZag, six holes of rings and teleports
 * @type {GolfHoleLayout[]}
 */

export const ZIGZAG_HOLES: GolfHoleLayout[] = [
  diagonalHole(),
  twinsHole(),
  forkHole(),
  mirrorsHole(),
  worldsHole(),
  blackholeHole(),
]
