import { cakeHole } from '@/declarations/play/golf/courses/candy/cake'
import { crushedHole } from '@/declarations/play/golf/courses/candy/crushed'
import { glazeHole } from '@/declarations/play/golf/courses/candy/glaze'
import { licoriceHole } from '@/declarations/play/golf/courses/candy/licorice'
import { stickHole } from '@/declarations/play/golf/courses/candy/stick'
import { syrupHole } from '@/declarations/play/golf/courses/candy/syrup'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'

/**
 * Candy Kingdom, six sweet classics
 * @type {GolfHoleLayout[]}
 */

export const CANDY_HOLES: GolfHoleLayout[] = [
  stickHole(),
  syrupHole(),
  glazeHole(),
  crushedHole(),
  licoriceHole(),
  cakeHole(),
]
