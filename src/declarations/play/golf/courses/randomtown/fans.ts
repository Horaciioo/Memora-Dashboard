import { slab } from '@/declarations/play/golf/courses/build'
import { cupField } from '@/declarations/play/golf/courses/randomtown/field'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'

// Heights: the paths sink a little, then the bowl
const TOP = 1.6
const BOWL = 12
const BOWL_END = 20

/**
 * Ventilo Score: a left path with one fan, a right path with two facing fans, then a bumper bowl
 * @return {GolfHoleLayout} - Hole
 */

export const fansHole = (): GolfHoleLayout => {
  const field = cupField(BOWL_END, { glass: 'news' })
  const bumpers = [-4.5, -1.5, 1.5, 4.5].flatMap((x, column) =>
    [14, 16, 18].map((z) => ({
      at: [x + (column % 2 ? 0.8 : -0.4), z] as [number, number],
      radius: 0.35,
    }))
  )

  return {
    tee: [0, 1.2],
    cup: field.centre,
    cups: field.cups,
    pads: [
      slab(-1.2, 0, 2.4, 2.4, TOP),
      // Left: west, south with a fan, east into the bowl
      slab(-6.2, 0, 5, 2.4, TOP),
      slab(-6.2, 2.4, 2.6, 9.6, TOP, 1),
      // Right: south, then east with the corner fans, south again
      slab(-1.2, 2.4, 2.4, 3.6, TOP, 1.4),
      slab(-1.2, 6, 7.4, 2.6, 1.4, 1.2),
      slab(3.6, 8.6, 2.6, 3.4, 1.2, 1),
      // Bowl, glass round it
      slab(-6.2, BOWL, 12.4, BOWL_END - BOWL, 1, 0, { glass: 'news' }),
      ...field.pads,
    ],
    fans: [
      { at: [-6.2, 5.5], size: [2.6, 1.8], push: [0, 1] },
      { at: [-1.2, 6.2], size: [1, 2.2], push: [1, 0] },
      { at: [2.6, 6.2], size: [1, 2.2], push: [-1, 0] },
    ],
    bumpers,
    orbs: [
      [-4.9, 9],
      [4.9, 11],
    ],
  }
}
