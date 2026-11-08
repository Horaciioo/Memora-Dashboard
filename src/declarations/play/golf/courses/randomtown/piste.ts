import { boosted, slab } from '@/declarations/play/golf/courses/build'
import { cupField } from '@/declarations/play/golf/courses/randomtown/field'
import type { GolfHoleLayout, GolfPadLayout, GolfPoint } from '@/core/lib/play/golf/types'

// Push of each cell, rows of three columns, null for plain turf
const CELLS: (GolfPoint | null)[][] = [
  [null, [0, 1], null],
  [[0.4, 1], null, [-0.4, 1]],
  [null, [0, 1], [0.5, 1]],
  [[-0.5, 1], [0, 1], null],
  [[0, 1], null, [0, 1]],
]

const COLUMN = 7 / 3
const LEFT = -3.5

/**
 * La Piste des accélérateurs: a slight climb buried in plates, a col, then the drop
 * @return {GolfHoleLayout} - Hole
 */

export const pisteHole = (): GolfHoleLayout => {
  const field = cupField(24)
  const rise = (row: number) => (row * 2 * 1) / 10
  const climb = CELLS.flatMap((cells, row) =>
    cells.map((push, column): GolfPadLayout => {
      const pad = slab(LEFT + column * COLUMN, 3 + row * 2, COLUMN, 2, rise(row), rise(row + 1))

      return push ? boosted(pad, push) : pad
    })
  )

  return {
    tee: [0, 1.5],
    cup: field.centre,
    cups: field.cups,
    pads: [
      slab(LEFT, 0, 7, 3, 0),
      ...climb,
      boosted(slab(LEFT, 13, COLUMN, 2, 1), [-0.3, 1]),
      slab(LEFT + COLUMN, 13, COLUMN, 2, 1),
      boosted(slab(LEFT + 2 * COLUMN, 13, COLUMN, 2, 1), [0.3, 1]),
      slab(LEFT, 15, 7, 9, 1, 0),
      ...field.pads,
    ],
    orbs: [
      [-2.3, 8],
      [2.3, 10],
    ],
  }
}
