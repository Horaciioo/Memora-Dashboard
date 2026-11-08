import { slab } from '@/declarations/play/golf/courses/build'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'

// Rows of pegs across the ditch, staggered
const ROWS = [
  { z: 9.3, xs: [-1.05, -0.35, 0.35, 1.05] },
  { z: 10.2, xs: [-0.7, 0, 0.7] },
  { z: 11.1, xs: [-1.05, -0.35, 0.35, 1.05] },
]

/**
 * La Ligne piquée: a springboard ramp over a ditch of pegs, or a slow way between them
 * @return {GolfHoleLayout} - Hole
 */

export const pegsHole = (): GolfHoleLayout => ({
  tee: [0, 1.5],
  cup: [0, 15],
  par: 3,
  pads: [
    slab(-1.5, 0, 3, 6),
    slab(-1.5, 6, 3, 2.5, 0, 0.7, { open: 'n' }),
    slab(-1.5, 8.8, 3, 3.2),
    slab(-1.5, 12, 3, 6),
  ],
  blocks: ROWS.flatMap(({ z, xs }) =>
    xs.map((x) => ({
      at: [x - 0.125, z] as [number, number],
      size: [0.25, 0.25] as [number, number],
    }))
  ),
  orbs: [
    [0, 4],
    [0, 13],
  ],
})
