import { coloursHole } from '@/declarations/play/golf/courses/zarbland/colours'
import { courtyardHole } from '@/declarations/play/golf/courses/zarbland/courtyard'
import { headwindHole } from '@/declarations/play/golf/courses/zarbland/headwind'
import { millHole } from '@/declarations/play/golf/courses/zarbland/mill'
import { tailwindHole } from '@/declarations/play/golf/courses/zarbland/tailwind'
import { vanesHole } from '@/declarations/play/golf/courses/zarbland/vanes'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'

/**
 * ZarbLand, six holes where the wind is a player
 * @type {GolfHoleLayout[]}
 */

export const ZARBLAND_HOLES: GolfHoleLayout[] = [
  coloursHole(),
  courtyardHole(),
  headwindHole(),
  tailwindHole(),
  vanesHole(),
  millHole(),
]
