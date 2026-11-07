import type { NavalSea } from '@/core/lib/play/naval/settings'

/**
 * Ship on the sea
 * @typedef {Object} NavalShip
 * @property {number} id - Place in the fleet
 * @property {number} length - Squares
 * @property {number} x - Column of the bow
 * @property {number} y - Row of the bow
 * @property {boolean} isHorizontal - Runs along a row
 */

export interface NavalShip {
  id: number
  length: number
  x: number
  y: number
  isHorizontal: boolean
}

// Random source
export type Rng = () => number

// Tries before a layout is dealt again
const PLACE_TRIES = 200
const DEAL_TRIES = 50

/**
 * Square index
 * @param {number} x - Column
 * @param {number} y - Row
 * @param {number} size - Sea size
 * @return {number} - Index
 */

export const indexOf = (x: number, y: number, size: number): number => y * size + x

/**
 * Squares of a ship
 * @param {NavalShip} ship - Ship
 * @return {Array<{ x: number; y: number }>} - Squares
 */

export const cellsOf = (ship: NavalShip): Array<{ x: number; y: number }> =>
  Array.from({ length: ship.length }, (_, step) => ({
    x: ship.x + (ship.isHorizontal ? step : 0),
    y: ship.y + (ship.isHorizontal ? 0 : step),
  }))

/**
 * Square inside the sea
 * @param {number} x - Column
 * @param {number} y - Row
 * @param {number} size - Sea size
 * @return {boolean} - Inside
 */

export const isInside = (x: number, y: number, size: number): boolean =>
  Number.isInteger(x) && Number.isInteger(y) && x >= 0 && y >= 0 && x < size && y < size

/**
 * Ship that fits the sea
 * @param {NavalShip} ship - Ship
 * @param {number} size - Sea size
 * @return {boolean} - Fits
 */

const isAfloat = (ship: NavalShip, size: number): boolean =>
  Number.isInteger(ship.length) &&
  ship.length > 0 &&
  cellsOf(ship).every(({ x, y }) => isInside(x, y, size))

/**
 * Two ships crowding each other
 * @param {NavalShip} left - Ship
 * @param {NavalShip} right - Other ship
 * @param {boolean} isSpaced - Touching counts
 * @return {boolean} - Crowded
 */

const isCrowded = (left: NavalShip, right: NavalShip, isSpaced: boolean): boolean => {
  const reach = isSpaced ? 1 : 0

  return cellsOf(left).some((a) =>
    cellsOf(right).some((b) => Math.abs(a.x - b.x) <= reach && Math.abs(a.y - b.y) <= reach)
  )
}

/**
 * Ship allowed beside the others
 * @param {NavalShip} ship - Ship
 * @param {NavalShip[]} others - Ships already placed
 * @param {NavalSea} sea - Sea
 * @return {boolean} - Allowed
 */

export const canPlace = (ship: NavalShip, others: NavalShip[], sea: NavalSea): boolean =>
  isAfloat(ship, sea.size) &&
  others.every((other) => other.id === ship.id || !isCrowded(ship, other, sea.isSpaced))

/**
 * Fleet the rules accept
 * @param {unknown} ships - Layout sent
 * @param {NavalSea} sea - Sea
 * @return {ships is NavalShip[]} - Valid
 */

export const isFleetValid = (ships: unknown, sea: NavalSea): ships is NavalShip[] => {
  if (!Array.isArray(ships) || ships.length !== sea.fleet.length) return false
  const fleet = ships as NavalShip[]
  const isShape = fleet.every(
    (ship) =>
      ship &&
      typeof ship.isHorizontal === 'boolean' &&
      [ship.id, ship.length, ship.x, ship.y].every(Number.isInteger)
  )
  if (!isShape) return false

  // The right ships, each once
  const lengths = fleet.map((ship) => ship.length).toSorted((a, b) => a - b)
  const wanted = sea.fleet.toSorted((a, b) => a - b)
  const ids = new Set(fleet.map((ship) => ship.id))

  return (
    lengths.every((length, index) => length === wanted[index]) &&
    ids.size === fleet.length &&
    fleet.every((ship) => canPlace(ship, fleet, sea))
  )
}

/**
 * Ship dropped at random where it fits
 * @param {number} length - Squares
 * @param {number} id - Place in the fleet
 * @param {NavalShip[]} placed - Ships already placed
 * @param {NavalSea} sea - Sea
 * @param {Rng} rng - Random source
 * @return {NavalShip | null} - Ship, none when crowded
 */

const dropShip = (
  length: number,
  id: number,
  placed: NavalShip[],
  sea: NavalSea,
  rng: Rng
): NavalShip | null => {
  for (let attempt = 0; attempt < PLACE_TRIES; attempt += 1) {
    const isHorizontal = rng() < 0.5
    const ship = {
      id,
      length,
      isHorizontal,
      x: Math.floor(rng() * (sea.size - (isHorizontal ? length - 1 : 0))),
      y: Math.floor(rng() * (sea.size - (isHorizontal ? 0 : length - 1))),
    }
    if (canPlace(ship, placed, sea)) return ship
  }

  return null
}

/**
 * Fleet finished from the ships already placed
 * @param {NavalShip[]} kept - Ships kept
 * @param {NavalSea} sea - Sea
 * @param {Rng} [rng] - Random source
 * @return {NavalShip[]} - Full fleet
 */

export const completeFleet = (
  kept: NavalShip[],
  sea: NavalSea,
  rng: Rng = Math.random
): NavalShip[] => {
  for (let deal = 0; deal < DEAL_TRIES; deal += 1) {
    // Only the ships that stand, then the missing lengths
    const placed = deal === 0 ? [...kept] : []
    const missing = [...sea.fleet]
    for (const ship of placed) {
      const at = missing.indexOf(ship.length)
      if (at >= 0) missing.splice(at, 1)
    }
    const usedIds = new Set(placed.map((ship) => ship.id))
    const freeIds = sea.fleet.map((_, id) => id).filter((id) => !usedIds.has(id))
    const fleet = [...placed]
    for (const [index, length] of missing.entries()) {
      const next = dropShip(length, freeIds[index], fleet, sea, rng)
      if (!next) break
      fleet.push(next)
    }
    if (fleet.length === sea.fleet.length) return fleet
  }

  throw new Error('Fleet does not fit the sea')
}

/**
 * Fleet laid out at random
 * @param {NavalSea} sea - Sea
 * @param {Rng} [rng] - Random source
 * @return {NavalShip[]} - Fleet
 */

export const randomFleet = (sea: NavalSea, rng: Rng = Math.random): NavalShip[] =>
  completeFleet([], sea, rng)
