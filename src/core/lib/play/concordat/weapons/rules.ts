import { buildingById, isWorking } from '@/core/lib/play/concordat/buildings/rules'
import { modeRules } from '@/core/lib/play/concordat/modes/rules'
import { reachOf } from '@/core/lib/play/concordat/sim/area'
import { ticksOf } from '@/core/lib/play/concordat/sim/tables'
import { tieKindOf } from '@/core/lib/play/concordat/diplomacy/ties'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatBuilding, ConcordatIntent, ConcordatState } from '@/types/concordat'
import {
  ConcordatBuildingKinds,
  ConcordatTerrains,
  ConcordatTies,
} from '@/utils/constants/concordat'
import type { ConcordatStrikeKind } from '@/utils/constants/concordat'

const { weapons, air } = CONCORDAT

/**
 * Weapons are on in this game
 * @param {ConcordatState} state - Game
 * @return {boolean} - On
 */

export const weaponsOn = (state: ConcordatState): boolean =>
  Boolean(CONCORDAT.features.weapons) && Boolean(modeRules(state.mode).weapons)

/**
 * Working silos of a nation
 * @param {ConcordatState} state - Game
 * @param {number} playerId - Nation
 * @return {ConcordatBuilding[]} - Silos
 */

export const silosOf = (state: ConcordatState, playerId: number): ConcordatBuilding[] =>
  state.buildings.filter(
    (building) =>
      building.owner === playerId &&
      building.kind === ConcordatBuildingKinds.Silo &&
      isWorking(building, state.tick)
  )

/**
 * Missiles the silos of a nation can keep
 * @param {ConcordatState} state - Game
 * @param {number} playerId - Nation
 * @return {number} - Stock ceiling
 */

export const stockCap = (state: ConcordatState, playerId: number): number =>
  silosOf(state, playerId).reduce((sum, silo) => sum + silo.level * weapons.stockPerLevel, 0)

/**
 * Seconds a missile flies, longer for a far target and for a heavy one
 * @param {ConcordatState} state - Game
 * @param {ConcordatStrikeKind} kind - Kind
 * @param {number} distance - Tiles from the source
 * @return {number} - Ticks
 */

export const flightTicks = (
  state: ConcordatState,
  kind: ConcordatStrikeKind,
  distance: number
): number => {
  // Guns are quick and flat
  if (kind === 'shell' || kind === 'rocket') {
    const base = kind === 'shell' ? air.battery.shellFlight : air.battery.rocketFlight

    return ticksOf(base + distance * 0.04)
  }
  const reach = Math.min(1, distance / weapons.range)
  const seconds = weapons.flightMin + (weapons.flightMax - weapons.flightMin) * reach

  return ticksOf(seconds + (kind === 'heavy' ? weapons.heavyExtra : 0))
}

/**
 * Reach of a battery of this level
 * @param {number} level - Level
 * @return {number} - Tiles
 */

export const batteryRange = (level: number): number =>
  air.battery.range[Math.min(level, air.battery.range.length) - 1]

// Tile checks shared by every strike
const tileRefusal = (state: ConcordatState, tile: number): string | null => {
  if (!Number.isInteger(tile) || tile < 0 || tile >= state.owner.length) return 'badTile'
  if (state.map.terrain[tile] === ConcordatTerrains.Sea) return 'badTerrain'

  return null
}

// Holder checks shared by every strike
const holderRefusal = (state: ConcordatState, playerId: number, tile: number): string | null => {
  const holder = state.owner[tile]
  const target = holder ? state.players[holder - 1] : null
  if (holder === playerId) return 'self'
  if (target && state.tick < target.protectedUntil) return 'protected'
  if (target && tieKindOf(state, playerId, holder) === ConcordatTies.Peace) return 'treaty'

  return null
}

// Shell or rocket from a battery
const gunRefusal = (
  state: ConcordatState,
  intent: Extract<ConcordatIntent, { kind: 'launch' }>
): string | null => {
  const battery = buildingById(state, intent.silo)
  if (
    !battery ||
    battery.owner !== intent.playerId ||
    battery.kind !== ConcordatBuildingKinds.Battery ||
    !isWorking(battery, state.tick)
  )
    return 'noBattery'
  if ((battery.coolAt ?? 0) > state.tick) return 'cooling'
  if (reachOf(battery.tile, intent.tile, state.map.width) > batteryRange(battery.level))
    return 'outOfRange'

  const refusal = holderRefusal(state, intent.playerId, intent.tile)
  if (refusal) return refusal
  const cost = intent.weapon === 'shell' ? air.battery.shellCost : air.battery.rocketCost

  return state.players[intent.playerId - 1].gold < cost ? 'noGold' : null
}

/**
 * Why a launch is refused, null when it flies
 * @param {ConcordatState} state - Game
 * @param {Extract<ConcordatIntent, { kind: 'launch' }>} intent - Launch
 * @return {string | null} - Reason
 */

export const launchRefusal = (
  state: ConcordatState,
  intent: Extract<ConcordatIntent, { kind: 'launch' }>
): string | null => {
  if (!weaponsOn(state)) return 'featureOff'
  const weapon = intent.weapon ?? (intent.heavy ? 'heavy' : 'missile')
  if (!state.weapons.includes(weapon)) return 'weaponOff'
  const isGun = intent.weapon === 'shell' || intent.weapon === 'rocket'
  const unlock = isGun ? air.unlockMinutes : weapons.unlockMinutes
  if (state.tick < state.pickEnd + ticksOf(unlock * 60)) return 'tooEarly'
  const badTile = tileRefusal(state, intent.tile)
  if (badTile) return badTile
  if (isGun) return gunRefusal(state, intent)

  const silo = silosOf(state, intent.playerId).find((building) => building.id === intent.silo)
  if (!silo) return 'noSilo'
  if (reachOf(silo.tile, intent.tile, state.map.width) > weapons.range) return 'outOfRange'

  const refusal = holderRefusal(state, intent.playerId, intent.tile)
  if (refusal) return refusal

  const arms = state.arms[intent.playerId - 1]
  if (intent.heavy) {
    if (!modeRules(state.mode).heavy) return 'heavyOff'
    if (silo.level < weapons.heavyLevel) return 'siloLevel'
    if (state.players[intent.playerId - 1].provincesHeld < CONCORDAT.merit.heavy)
      return 'needsZones'
    if (arms.heavy >= weapons.heavyMax) return 'heavySpent'

    return state.players[intent.playerId - 1].gold < weapons.heavyCost ? 'noGold' : null
  }
  if (arms.missiles < 1) return 'noMissile'

  return state.players[intent.playerId - 1].gold < weapons.missileCost ? 'noGold' : null
}
