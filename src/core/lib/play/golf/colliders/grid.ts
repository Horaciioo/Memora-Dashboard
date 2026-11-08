import type { GolfBox, GolfGrid } from '@/core/lib/play/golf/colliders/types'

/**
 * Cell span of a box
 * @param {GolfGrid} grid - Grid
 * @param {GolfBox} box - Box
 * @return {number[]} - Columns then rows, first and last
 */

const spanOf = (grid: GolfGrid, box: GolfBox): number[] => {
  const clamp = (value: number, size: number) => Math.min(size - 1, Math.max(0, value))

  return [
    clamp(Math.floor((box.x0 - grid.x0) / grid.cell), grid.cols),
    clamp(Math.floor((box.x1 - grid.x0) / grid.cell), grid.cols),
    clamp(Math.floor((box.z0 - grid.z0) / grid.cell), grid.rows),
    clamp(Math.floor((box.z1 - grid.z0) / grid.cell), grid.rows),
  ]
}

/**
 * Grid holding each shape in the cells it covers
 * @param {GolfBox[]} boxes - Shape boxes
 * @param {number} cell - Cell size
 * @return {GolfGrid} - Grid
 */

export const gridOf = (boxes: GolfBox[], cell: number): GolfGrid => {
  const x0 = Math.min(0, ...boxes.map((box) => box.x0))
  const z0 = Math.min(0, ...boxes.map((box) => box.z0))
  const x1 = Math.max(x0 + cell, ...boxes.map((box) => box.x1))
  const z1 = Math.max(z0 + cell, ...boxes.map((box) => box.z1))
  const cols = Math.ceil((x1 - x0) / cell) + 1
  const rows = Math.ceil((z1 - z0) / cell) + 1
  const grid: GolfGrid = {
    cell,
    x0,
    z0,
    cols,
    rows,
    cells: Array.from({ length: cols * rows }, () => []),
  }

  // Filed once per covered cell
  boxes.forEach((box, index) => {
    const [c0, c1, r0, r1] = spanOf(grid, box)
    for (let row = r0; row <= r1; row += 1) {
      for (let col = c0; col <= c1; col += 1) grid.cells[row * cols + col].push(index)
    }
  })

  return grid
}

/**
 * Shapes near a box, each once
 * @param {GolfGrid} grid - Grid
 * @param {GolfBox} box - Searched box
 * @return {number[]} - Shape indexes
 */

export const queryGrid = (grid: GolfGrid, box: GolfBox): number[] => {
  const [c0, c1, r0, r1] = spanOf(grid, box)
  const found = new Set<number>()
  for (let row = r0; row <= r1; row += 1) {
    for (let col = c0; col <= c1; col += 1) {
      for (const index of grid.cells[row * grid.cols + col]) found.add(index)
    }
  }

  return [...found]
}

/**
 * Box of a move, grown by a radius
 * @param {number[]} move - From x, from z, to x, to z
 * @param {number} radius - Growth
 * @return {GolfBox} - Box
 */

export const sweepBox = ([ax, az, bx, bz]: number[], radius: number): GolfBox => ({
  x0: Math.min(ax, bx) - radius,
  z0: Math.min(az, bz) - radius,
  x1: Math.max(ax, bx) + radius,
  z1: Math.max(az, bz) + radius,
})
