import { detourHole } from '@/declarations/play/golf/courses/droppinhit/detour'
import { duneHole } from '@/declarations/play/golf/courses/droppinhit/dune'
import { flanksHole } from '@/declarations/play/golf/courses/droppinhit/flanks'
import { hillHole } from '@/declarations/play/golf/courses/droppinhit/hill'
import { plateauHole } from '@/declarations/play/golf/courses/droppinhit/plateau'
import { rectangleHole } from '@/declarations/play/golf/courses/droppinhit/rectangle'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'

/**
 * DroppinHit, six classic holes with one trap each
 * @type {GolfHoleLayout[]}
 */

export const DROPPINHIT_HOLES: GolfHoleLayout[] = [
  rectangleHole(),
  flanksHole(),
  hillHole(),
  duneHole(),
  plateauHole(),
  detourHole(),
]
