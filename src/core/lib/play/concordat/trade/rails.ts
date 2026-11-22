import { distanceBetween } from '@/core/lib/play/concordat/map'
import { ConcordatTerrains } from '@/utils/constants/concordat'

/**
 * One rail: the station it reaches and the tiles walked to it, the start left out
 * @typedef {Object} ConcordatRail
 */

export interface ConcordatRail {
  station: number
  line: number[]
}

// Tiles walked through corner points, each leg straight, the start left out
const through = (width: number, corners: [number, number][]): number[] => {
  const tiles: number[] = []
  let [x, y] = corners[0]
  for (const [endX, endY] of corners.slice(1)) {
    while (x !== endX || y !== endY) {
      if (x !== endX) x += Math.sign(endX - x)
      else y += Math.sign(endY - y)
      tiles.push(y * width + x)
    }
  }

  return tiles
}

/**
 * Rail path between two tiles: one L at most, over land only, never a zigzag. Null when both elbows touch water
 * @param {Uint8Array} terrain - Terrain per tile
 * @param {number} width - Map width
 * @param {number} from - Start tile
 * @param {number} to - End tile
 * @return {number[] | null} - Tiles after the start
 */

export const railPathOf = (
  terrain: ArrayLike<number>,
  width: number,
  from: number,
  to: number
): number[] | null => {
  const x0 = from % width
  const y0 = Math.floor(from / width)
  const x1 = to % width
  const y1 = Math.floor(to / width)
  const isLand = (line: number[]) => line.every((tile) => terrain[tile] !== ConcordatTerrains.Sea)
  const shapes: [number, number][][] = [
    [
      [x0, y0],
      [x1, y0],
      [x1, y1],
    ],
    [
      [x0, y0],
      [x0, y1],
      [x1, y1],
    ],
  ]
  for (const corners of shapes) {
    const line = through(width, corners)
    if (isLand(line)) return line
  }

  return null
}

/**
 * Rails of a factory: the nearest stations in range that a rail can reach
 * @param {Uint8Array} terrain - Terrain per tile
 * @param {number} width - Map width
 * @param {number} factory - Factory tile
 * @param {number[]} stations - Station tiles
 * @param {number} range - Longest rail in tiles
 * @param {number} max - Rails a factory lays
 * @return {ConcordatRail[]} - Rails, nearest first
 */

export const railsOf = (
  terrain: ArrayLike<number>,
  width: number,
  factory: number,
  stations: number[],
  range: number,
  max: number
): ConcordatRail[] => {
  const rails: ConcordatRail[] = []
  const near = stations
    .filter((tile) => tile !== factory && distanceBetween(factory, tile, width) <= range)
    .sort((a, b) => distanceBetween(factory, a, width) - distanceBetween(factory, b, width))

  for (const station of near) {
    const line = railPathOf(terrain, width, factory, station)
    if (line) rails.push({ station, line })
    if (rails.length >= max) break
  }

  return rails
}

/**
 * Corner tiles of a rail, the start included: the points a polyline needs
 * @param {number} width - Map width
 * @param {number} from - Start tile
 * @param {number[]} line - Tiles after the start
 * @return {number[]} - Corners
 */

export const cornersOf = (width: number, from: number, line: number[]): number[] => {
  const corners = [from]
  let before = from
  let step = 0
  for (const tile of line) {
    const next = tile - before
    if (step && next !== step) corners.push(before)
    step = next
    before = tile
  }
  corners.push(before)

  return corners
}
