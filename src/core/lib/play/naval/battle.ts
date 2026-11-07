import { cellsOf } from '@/core/lib/play/naval/fleet'
import type { NavalShip } from '@/core/lib/play/naval/fleet'
import { NavalResults } from '@/utils/constants/play'
import type { NavalResultName } from '@/utils/constants/play'

/**
 * Square fired at
 * @typedef {Object} NavalCell
 * @property {number} x - Column
 * @property {number} y - Row
 */

export interface NavalCell {
  x: number
  y: number
}

/**
 * What a shell did
 * @typedef {Object} NavalOutcome
 * @property {NavalResultName} result - Miss, hit or sunk
 * @property {NavalShip | null} ship - Ship struck
 */

export interface NavalOutcome {
  result: NavalResultName
  ship: NavalShip | null
}

/**
 * Same square
 * @param {NavalCell} left - Square
 * @param {NavalCell} right - Other square
 * @return {boolean} - Same
 */

const isSame = (left: NavalCell, right: NavalCell): boolean =>
  left.x === right.x && left.y === right.y

/**
 * Ships whose squares were all hit
 * @param {NavalShip[]} fleet - Fleet
 * @param {NavalCell[]} shots - Squares fired at
 * @return {NavalShip[]} - Sunk ships
 */

export const sunkShips = (fleet: NavalShip[], shots: NavalCell[]): NavalShip[] =>
  fleet.filter((ship) => cellsOf(ship).every((cell) => shots.some((shot) => isSame(shot, cell))))

/**
 * Ships still afloat
 * @param {NavalShip[]} fleet - Fleet
 * @param {NavalCell[]} shots - Squares fired at
 * @return {NavalShip[]} - Ships afloat
 */

export const shipsAfloat = (fleet: NavalShip[], shots: NavalCell[]): NavalShip[] => {
  const sunk = new Set(sunkShips(fleet, shots).map((ship) => ship.id))

  return fleet.filter((ship) => !sunk.has(ship.id))
}

/**
 * Outcome of a shell on a fleet
 * @param {NavalShip[]} fleet - Fleet fired at
 * @param {NavalCell[]} previous - Squares already fired at
 * @param {NavalCell} cell - Square aimed at
 * @return {NavalOutcome} - Outcome
 */

export const resolveShot = (
  fleet: NavalShip[],
  previous: NavalCell[],
  cell: NavalCell
): NavalOutcome => {
  const ship = fleet.find((entry) => cellsOf(entry).some((square) => isSame(square, cell)))
  if (!ship) return { result: NavalResults.Miss, ship: null }

  // Sunk when this was its last square
  const isSunk = cellsOf(ship).every(
    (square) => isSame(square, cell) || previous.some((shot) => isSame(shot, square))
  )

  return { result: isSunk ? NavalResults.Sunk : NavalResults.Hit, ship }
}
