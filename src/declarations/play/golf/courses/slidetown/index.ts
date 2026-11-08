import { bumpersHole } from '@/declarations/play/golf/courses/slidetown/bumpers'
import { crossHole } from '@/declarations/play/golf/courses/slidetown/cross'
import { loopHole } from '@/declarations/play/golf/courses/slidetown/loop'
import { narrowHole } from '@/declarations/play/golf/courses/slidetown/narrow'
import { pipeHole } from '@/declarations/play/golf/courses/slidetown/pipe'
import { trioHole } from '@/declarations/play/golf/courses/slidetown/trio'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'

// Points won by the first ball holed
const TIME_BONUS = 2

/**
 * SlideTown, six slides ending on six holes worth 3, 2, 1, 0, 2, 3 points
 * @type {GolfHoleLayout[]}
 */

export const SLIDETOWN_HOLES: GolfHoleLayout[] = [
  trioHole(),
  bumpersHole(),
  pipeHole(),
  loopHole(),
  crossHole(),
  narrowHole(),
].map((layout) => ({ ...layout, timeBonus: TIME_BONUS }))
