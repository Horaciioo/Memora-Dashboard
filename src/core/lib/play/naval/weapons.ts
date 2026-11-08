import { resolveShot } from '@/core/lib/play/naval/battle'
import type { NavalCell } from '@/core/lib/play/naval/battle'
import { cellsOf, isInside } from '@/core/lib/play/naval/fleet'
import type { NavalShip, Rng } from '@/core/lib/play/naval/fleet'
import { NAVAL_WEAPONS } from '@/declarations/play/naval/weapons'
import type { NavalWeapon } from '@/declarations/play/naval/weapons'
import { NavalResults, NavalShapes, NavalWeapons } from '@/utils/constants/play'
import type { NavalResultName, NavalWeaponName } from '@/utils/constants/play'

/**
 * Square a strike touched
 * @typedef {Object} NavalStrikeCell
 */

export interface NavalStrikeCell extends NavalCell {
  result: NavalResultName
}

// Orientations a weapon takes, four for the torpedo
export const NAVAL_TURNS = { line: 2, ray: 4 } as const

// Torpedo heading per orientation: east, south, west, north
const HEADINGS = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1],
]

/**
 * Weapon of the catalogue
 * @param {NavalWeaponName} name - Key
 * @return {NavalWeapon} - Weapon
 */

export const weaponOf = (name: NavalWeaponName): NavalWeapon =>
  NAVAL_WEAPONS.find((weapon) => weapon.name === name) ?? NAVAL_WEAPONS[0]

/**
 * Wire code of a weapon
 * @param {string} name - Key
 * @return {number} - Code
 */

export const weaponCode = (name: string): number =>
  Math.max(
    0,
    NAVAL_WEAPONS.findIndex((weapon) => weapon.name === name)
  )

/**
 * Weapon name a body sent
 * @param {unknown} raw - Sent value
 * @return {NavalWeaponName} - Weapon, the cannon by default
 */

export const readWeaponName = (raw: unknown): NavalWeaponName =>
  NAVAL_WEAPONS.find((weapon) => weapon.name === raw)?.name ?? NavalWeapons.Cannon

/**
 * Orientations a weapon can take
 * @param {NavalWeapon} weapon - Weapon
 * @return {number} - Count, one when it cannot turn
 */

export const turnsOf = (weapon: NavalWeapon): number =>
  weapon.shape === NavalShapes.Line
    ? NAVAL_TURNS.line
    : weapon.shape === NavalShapes.Ray
      ? NAVAL_TURNS.ray
      : 1

/**
 * Result that damages a fleet
 * @param {string} result - Result
 * @return {boolean} - Damage, scouting excluded
 */

export const isDamage = (result: string): boolean =>
  result === NavalResults.Miss || result === NavalResults.Hit || result === NavalResults.Sunk

/**
 * Squares a weapon covers, clipped to the sea
 * @param {NavalWeapon} weapon - Weapon
 * @param {NavalCell} origin - Square aimed at
 * @param {number} orientation - Orientation
 * @param {number} size - Sea size
 * @return {NavalCell[]} - Squares, the torpedo path from its edge
 */

export const zoneOf = (
  weapon: NavalWeapon,
  origin: NavalCell,
  orientation: number,
  size: number
): NavalCell[] => {
  const { reach } = weapon
  const cells: NavalCell[] = []
  if (weapon.shape === NavalShapes.Point) cells.push(origin)
  if (weapon.shape === NavalShapes.Line) {
    const start = -Math.floor((reach - 1) / 2)
    for (let step = start; step < start + reach; step += 1)
      cells.push(
        orientation % 2 === 0
          ? { x: origin.x + step, y: origin.y }
          : { x: origin.x, y: origin.y + step }
      )
  }
  if (weapon.shape === NavalShapes.Cross) {
    cells.push(origin)
    for (let step = 1; step <= reach; step += 1)
      for (const [dx, dy] of HEADINGS)
        cells.push({ x: origin.x + dx * step, y: origin.y + dy * step })
  }
  if (weapon.shape === NavalShapes.Square) {
    for (let dy = -reach; dy <= reach; dy += 1)
      for (let dx = -reach; dx <= reach; dx += 1) cells.push({ x: origin.x + dx, y: origin.y + dy })
  }
  if (weapon.shape === NavalShapes.Ray) {
    const [dx, dy] = HEADINGS[orientation % HEADINGS.length]
    const x = dx > 0 ? 0 : dx < 0 ? size - 1 : origin.x
    const y = dy > 0 ? 0 : dy < 0 ? size - 1 : origin.y
    for (let step = 0; step < size; step += 1) cells.push({ x: x + dx * step, y: y + dy * step })
  }

  return cells.filter((cell) => isInside(cell.x, cell.y, size))
}

/**
 * Squares a strike resolves, one function for every weapon
 * @param {Object} input - Strike
 * @param {NavalWeapon} input.weapon - Weapon
 * @param {NavalCell} input.origin - Square aimed at
 * @param {number} input.orientation - Orientation
 * @param {NavalShip[]} input.fleet - Fleet fired at
 * @param {NavalCell[]} input.fired - Squares already struck
 * @param {NavalCell[]} [input.seen] - Squares already lit
 * @param {number} input.size - Sea size
 * @return {NavalStrikeCell[]} - New squares, empty when nothing is left
 */

export const strike = ({
  weapon,
  origin,
  orientation,
  fleet,
  fired,
  seen = [],
  size,
}: {
  weapon: NavalWeapon
  origin: NavalCell
  orientation: number
  fleet: NavalShip[]
  fired: NavalCell[]
  seen?: NavalCell[]
  size: number
}): NavalStrikeCell[] => {
  const key = (cell: NavalCell) => cell.y * size + cell.x
  const done = new Set(fired.map(key))
  const zone = zoneOf(weapon, origin, orientation, size)

  // Flare lights squares, nothing is struck
  if (weapon.shape === NavalShapes.Square) {
    const lit = new Set(seen.map(key))
    const ships = new Set(fleet.flatMap((ship) => cellsOf(ship).map(key)))

    return zone
      .filter((cell) => !done.has(key(cell)) && !lit.has(key(cell)))
      .map((cell) => ({
        ...cell,
        result: ships.has(key(cell)) ? NavalResults.Spotted : NavalResults.Clear,
      }))
  }

  // Each square in turn, a sunk ship counted once
  const struck: NavalStrikeCell[] = []
  const history = [...fired]
  for (const cell of zone) {
    if (done.has(key(cell))) continue
    const { result } = resolveShot(fleet, history, cell)
    struck.push({ ...cell, result })
    history.push(cell)
    done.add(key(cell))
    if (weapon.shape === NavalShapes.Ray && result !== NavalResults.Miss) break
  }

  return struck
}

/**
 * Weapons offered for a turn, drawn by weight, the cannon apart
 * @param {number} count - Weapons drawn
 * @param {Rng} [rng] - Random source
 * @return {NavalWeaponName[]} - Weapons
 */

export const drawOffer = (count: number, rng: Rng = Math.random): NavalWeaponName[] => {
  const pool = NAVAL_WEAPONS.filter((weapon) => weapon.weight > 0)
  const offer: NavalWeaponName[] = []
  while (offer.length < count && pool.length) {
    const total = pool.reduce((sum, weapon) => sum + weapon.weight, 0)
    let roll = rng() * total
    const at = pool.findIndex((weapon) => (roll -= weapon.weight) < 0)
    const [picked] = pool.splice(at < 0 ? pool.length - 1 : at, 1)
    offer.push(picked.name)
  }

  return offer
}

/**
 * Weapon a captain may fire now
 * @param {NavalWeaponName} name - Weapon
 * @param {Object} arms - Captain arms
 * @param {number} arms.ammo - Ammo held
 * @param {string[]} arms.offer - Weapons offered
 * @return {boolean} - Allowed
 */

export const canWield = (
  name: NavalWeaponName,
  { ammo, offer }: { ammo: number; offer: string[] }
) => {
  const weapon = weaponOf(name)
  const isOffered = weapon.cost === 0 || offer.includes(name)

  return isOffered && ammo >= weapon.cost
}
