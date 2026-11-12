import { paintBommie } from '@/composites/play/naval/world/decor/coral/bommie'
import type { DecorPainter } from '@/composites/play/naval/world/decor/types'
import { stageActor } from '@/composites/play/naval/world/life'
import { fbm, pieceRng } from '@/composites/play/naval/world/noise'

// Squares of one cell of the scatter
const CELL = 1.9
// Water over the mounds: under the grid, then around it
const GRID_VEIL = 0.46
const BAND_VEIL = 0.22
// Fish schools roaming the floor
const SCHOOLS = 3

/**
 * Coral floor of the whole board, the grid included: mounds scattered by noise, veiled deeper under
 * the grid so squares, marks and ships stay readable, light rippling over it all
 * @param {DecorScene} scene - Scene
 * @return {void}
 */

export const paintSeabed: DecorPainter = (scene) => {
  const { pen, board, look, piece, seed } = scene
  const { land } = look
  const rng = pieceRng(seed)
  const isOnGrid = (x: number, y: number) =>
    x > board.left && x < board.left + board.size && y > board.top && y < board.top + board.size
  for (let row = 0; row < board.height / CELL; row += 1) {
    for (let column = 0; column < board.width / CELL; column += 1) {
      const x = (column + 0.2 + rng() * 0.6) * CELL
      const y = (row + 0.2 + rng() * 0.6) * CELL
      if (fbm(x / 6, y / 6, seed, 3) < 1 - piece.scale) continue
      const onGrid = isOnGrid(x, y)
      paintBommie(pen, look, {
        x,
        y,
        radius: (onGrid ? 0.42 : 0.5) + rng() * 0.38,
        veil: onGrid ? GRID_VEIL : BAND_VEIL,
        rng,
        seed: seed + row * 101 + column,
      })
    }
  }
  for (let school = 0; school < SCHOOLS; school += 1) {
    stageActor(scene, {
      kind: 'fish',
      x: board.left + board.size * (0.25 + rng() * 0.5),
      y: board.top + board.size * (0.25 + rng() * 0.5),
      rx: board.size * 0.3,
      ry: board.size * 0.22,
      count: 7,
      size: 0.08,
      colours: [[land.fishYellow, land.fishBlue, land.fishOrange][school % 3]],
      seed: school * 7.3,
    })
  }
}
