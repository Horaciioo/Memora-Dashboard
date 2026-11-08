import { blindHole } from '@/declarations/play/golf/courses/randomtown/blind'
import { descentHole } from '@/declarations/play/golf/courses/randomtown/descent'
import { discHole } from '@/declarations/play/golf/courses/randomtown/disc'
import { fansHole } from '@/declarations/play/golf/courses/randomtown/fans'
import { pisteHole } from '@/declarations/play/golf/courses/randomtown/piste'
import { terracesHole } from '@/declarations/play/golf/courses/randomtown/terraces'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'

/**
 * RandomTown, six descents ending on five holes worth 2, 1, 0, 1, 2 points
 * @type {GolfHoleLayout[]}
 */

export const RANDOMTOWN_HOLES: GolfHoleLayout[] = [
  discHole(),
  descentHole(),
  pisteHole(),
  blindHole(),
  fansHole(),
  terracesHole(),
]
