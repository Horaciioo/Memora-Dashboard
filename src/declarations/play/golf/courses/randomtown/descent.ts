import { slab } from '@/declarations/play/golf/courses/build'
import { cupField } from '@/declarations/play/golf/courses/randomtown/field'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'

// Slope: top height, length
const TOP = 8.4
const LENGTH = 14
const START = 3

/**
 * La Descente verticale: a steep slope behind glass strewn with bumpers
 * @return {GolfHoleLayout} - Hole
 */

export const descentHole = (): GolfHoleLayout => {
  const field = cupField(START + LENGTH, { glass: 'ew' })
  const rows = [4.5, 8.5, 12.5]

  return {
    tee: [0, 1.4],
    cup: field.centre,
    cups: field.cups,
    pads: [
      slab(-1.8, 0, 3.6, START, TOP, TOP),
      slab(-4.5, START, 9, LENGTH, TOP, 0, { glass: 'ew' }),
      ...field.pads,
    ],
    bumpers: rows.flatMap((z, row) =>
      (row % 2 ? [-3, -1, 1, 3] : [-2.5, 0, 2.5]).map((x) => ({
        at: [x, z] as [number, number],
        radius: 0.35,
      }))
    ),
    // Narrow neck recentring the fall
    blocks: [
      { at: [-4.5, 9.8], size: [1.5, 0.3] },
      { at: [3, 9.8], size: [1.5, 0.3] },
    ],
    orbs: [[0, 6.5]],
  }
}
