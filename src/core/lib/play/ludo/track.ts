import { LUDO_LAYOUT } from '@/declarations/play/ludo/board'
import type { LudoCell } from '@/declarations/play/ludo/board'

// Corners on the board
const CORNERS = 4
// Squares of one quarter
const QUARTER = LUDO_LAYOUT.quarter.length

/**
 * Squares around the board
 * @type {number}
 */

export const TRACK_LENGTH = QUARTER * CORNERS

// Steps on the track before the lane, the start square counted
const LAP = TRACK_LENGTH - 1

/**
 * Step of a pawn at home
 * @type {number}
 */

export const GOAL_STEP = LAP + LUDO_LAYOUT.lane.length

// Step of a pawn in its yard
export const YARD_STEP = -1

/**
 * Cell turned a quarter clockwise, whole cells
 * @param {LudoCell} cell - Grid cell
 * @param {number} quarters - Quarter turns
 * @return {LudoCell} - Turned cell
 */

export const turnCell = ([row, column]: LudoCell, quarters: number): LudoCell => {
  const turns = ((quarters % CORNERS) + CORNERS) % CORNERS
  let cell: LudoCell = [row, column]
  for (let index = 0; index < turns; index += 1) cell = [cell[1], LUDO_LAYOUT.size - 1 - cell[0]]

  return cell
}

/**
 * Point turned a quarter clockwise, cell units
 * @param {LudoCell} point - Point
 * @param {number} quarters - Quarter turns
 * @return {LudoCell} - Turned point
 */

export const turnPoint = ([y, x]: LudoCell, quarters: number): LudoCell => {
  const turns = ((quarters % CORNERS) + CORNERS) % CORNERS
  let point: LudoCell = [y, x]
  for (let index = 0; index < turns; index += 1) point = [point[1], LUDO_LAYOUT.size - point[0]]

  return point
}

/**
 * Every track square, the first corner's start first
 * @type {readonly LudoCell[]}
 */

export const TRACK: readonly LudoCell[] = Array.from({ length: CORNERS }, (_, corner) =>
  LUDO_LAYOUT.quarter.map((cell) => turnCell(cell, corner))
).flat()

/**
 * Track square of a corner's step
 * @param {number} corner - Corner
 * @param {number} step - Step on the track
 * @return {number} - Square index
 */

export const squareOf = (corner: number, step: number): number =>
  (corner * QUARTER + step) % TRACK_LENGTH

/**
 * Step still on the shared track
 * @param {number} step - Step
 * @return {boolean} - On the track
 */

export const isOnTrack = (step: number): boolean => step >= 0 && step < LAP

/**
 * Squares nobody is taken on, starts and stars
 * @type {ReadonlySet<number>}
 */

export const SAFE_SQUARES: ReadonlySet<number> = new Set(
  Array.from({ length: CORNERS }, (_, corner) => [
    squareOf(corner, 0),
    squareOf(corner, LUDO_LAYOUT.starOffset),
  ]).flat()
)

/**
 * Centre of a cell, cell units
 * @param {LudoCell} cell - Grid cell
 * @return {LudoCell} - Point
 */

const centreOf = ([row, column]: LudoCell): LudoCell => [row + 0.5, column + 0.5]

/**
 * Where a pawn stands, cell units
 * @param {number} corner - Pawn colour
 * @param {number} step - Pawn step
 * @param {number} pawn - Pawn index
 * @return {LudoCell} - Point
 */

export const pawnPoint = (corner: number, step: number, pawn: number): LudoCell => {
  if (step <= YARD_STEP) return turnPoint(LUDO_LAYOUT.yardSpots[pawn], corner)
  if (step >= GOAL_STEP) return turnPoint(LUDO_LAYOUT.goalSpots[pawn], corner)
  if (isOnTrack(step)) return centreOf(TRACK[squareOf(corner, step)])

  return centreOf(turnCell(LUDO_LAYOUT.lane[step - LAP], corner))
}

/**
 * Stars with a pawn stopped on them, one bit per corner
 * @param {{ accountId: string, corner: number }[]} players - Colours on the board
 * @param {Record<string, number[]>} pawns - Steps on screen
 * @param {{ accountId: string, pawn: number } | null} walking - Pawn passing through
 * @return {number} - Bit mask
 */

export const heldStars = (
  players: { accountId: string; corner: number }[],
  pawns: Record<string, number[]>,
  walking: { accountId: string; pawn: number } | null
): number =>
  players.reduce(
    (mask, { accountId, corner }) =>
      (pawns[accountId] ?? []).reduce((held, step, pawn) => {
        const isPassing = walking?.accountId === accountId && walking.pawn === pawn
        const square = squareOf(corner, step)
        const isStar = isOnTrack(step) && square % QUARTER === LUDO_LAYOUT.starOffset

        return isStar && !isPassing ? held | (1 << Math.floor(square / QUARTER)) : held
      }, mask),
    0
  )
