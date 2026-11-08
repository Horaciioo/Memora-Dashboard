import { chicanesHole } from '@/declarations/play/golf/courses/speedtown/chicanes'
import { diamondHole } from '@/declarations/play/golf/courses/speedtown/diamond'
import { relayHole } from '@/declarations/play/golf/courses/speedtown/relay'
import { snailHole } from '@/declarations/play/golf/courses/speedtown/snail'
import { spiralHole } from '@/declarations/play/golf/courses/speedtown/spiral'
import { thoroughbredHole } from '@/declarations/play/golf/courses/speedtown/thoroughbred'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'

/**
 * SpeedTown, six holes played on boosts
 * @type {GolfHoleLayout[]}
 */

export const SPEEDTOWN_HOLES: GolfHoleLayout[] = [
  spiralHole(),
  thoroughbredHole(),
  diamondHole(),
  snailHole(),
  chicanesHole(),
  relayHole(),
]
