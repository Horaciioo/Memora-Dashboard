import naval from '@/configurations/play/naval.json'
import { readChoice, readInteger, readNode } from '@/declarations/configurations/readers'
import { NavalShapes, NavalWeapons } from '@/utils/constants/play'
import type { NavalShapeName, NavalWeaponName } from '@/utils/constants/play'

// Raw node
const weapons = readNode(naval.weapons, 'play/naval.weapons')

/**
 * Weapon of the catalogue
 * @typedef {Object} NavalWeapon
 * @property {NavalWeaponName} name - Key
 * @property {NavalShapeName} shape - Footprint
 * @property {number} reach - Footprint size
 * @property {number} cost - Ammo spent
 * @property {number} weight - Draw weight, zero never drawn
 */

export interface NavalWeapon {
  name: NavalWeaponName
  shape: NavalShapeName
  reach: number
  cost: number
  weight: number
}

/**
 * Weapon read from the config
 * @param {NavalWeaponName} name - Key
 * @return {NavalWeapon} - Weapon
 */

const readWeapon = (name: NavalWeaponName): NavalWeapon => {
  const path = `play/naval.weapons.${name}`
  const node = readNode(weapons[name], path)

  return {
    name,
    shape: readChoice<NavalShapeName>(node.shape, {
      path: `${path}.shape`,
      fallback: NavalShapes.Point,
      allowed: Object.values(NavalShapes),
    }),
    reach: readInteger(node.reach, { path: `${path}.reach`, fallback: 0, min: 0, max: 36 }),
    cost: readInteger(node.cost, { path: `${path}.cost`, fallback: 0, min: 0 }),
    weight: readInteger(node.weight, { path: `${path}.weight`, fallback: 0, min: 0 }),
  }
}

/**
 * Weapon catalogue, its order is the wire code
 * @type {NavalWeapon[]}
 */

export const NAVAL_WEAPONS: NavalWeapon[] = Object.values(NavalWeapons).map(readWeapon)
