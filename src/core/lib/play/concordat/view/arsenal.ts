import { priceOf, raisePriceOf } from '@/core/lib/play/concordat/buildings/price'
import { reachOf } from '@/core/lib/play/concordat/sim/area'
import { ticksOf } from '@/core/lib/play/concordat/sim/tables'
import type { ConcordatClientState } from '@/core/lib/play/concordat/wire/board'
import type { ConcordatBuildingRow } from '@/core/lib/play/concordat/wire/systems'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import { ConcordatBuildingKinds } from '@/utils/constants/concordat'
import type { ConcordatBuildingKind } from '@/utils/constants/concordat'

const { buildings, weapons, air } = CONCORDAT

/**
 * Buildings of a kind the player holds
 * @param {ConcordatClientState} client - Game
 * @param {ConcordatBuildingKind} kind - Kind
 * @return {number} - Count
 */

export const builtCountOf = (client: ConcordatClientState, kind: ConcordatBuildingKind): number =>
  client.systems.buildings.filter(
    (building) => building.owner === client.me && building.kind === kind
  ).length

/**
 * Gold of a new building, each one held makes it dearer
 * @param {ConcordatClientState} client - Game
 * @param {ConcordatBuildingKind} kind - Kind
 * @return {number} - Gold
 */

export const buildCostOf = (client: ConcordatClientState, kind: ConcordatBuildingKind): number => {
  const held = builtCountOf(client, kind)

  return priceOf(kind, held)
}

/**
 * Gold to raise a building one level, zero at the top
 * @param {ConcordatBuildingRow} building - Building
 * @return {number} - Gold
 */

export const upgradeCostOf = (building: ConcordatBuildingRow): number =>
  building.level >= buildings.kinds[building.kind].levels.length
    ? 0
    : raisePriceOf(building.kind, building.level)

/**
 * Own building near a tile, the weakest of a stack
 * @param {ConcordatClientState} client - Game
 * @param {number} tile - Tile
 * @return {ConcordatBuildingRow | undefined} - Building
 */

export const ownBuildingNear = (
  client: ConcordatClientState,
  tile: number
): ConcordatBuildingRow | undefined =>
  client.systems.buildings
    .filter(
      (building) =>
        building.owner === client.me && reachOf(building.tile, tile, client.map.width) <= 1
    )
    .sort((a, b) => a.level - b.level)[0]

/**
 * Tick from which missiles may fly
 * @param {ConcordatClientState} client - Game
 * @return {number} - Tick
 */

export const weaponsOpenAt = (client: ConcordatClientState): number =>
  client.pickEnd + ticksOf(weapons.unlockMinutes * 60)

/**
 * Stock of my nation and the ceiling my silos hold
 * @param {ConcordatClientState} client - Game
 * @return {{ missiles: number; heavy: number; cap: number }} - Stock
 */

export const stockOf = (client: ConcordatClientState) => {
  const arms = client.systems.arms[client.me - 1]
  const cap = client.systems.buildings
    .filter(
      (building) =>
        building.owner === client.me &&
        building.kind === ConcordatBuildingKinds.Silo &&
        building.readyAt <= client.tick
    )
    .reduce((sum, silo) => sum + silo.level * weapons.stockPerLevel, 0)

  return { missiles: arms?.missiles ?? 0, heavy: arms?.heavy ?? 0, cap }
}

/**
 * Nearest working silo of mine that reaches a tile
 * @param {ConcordatClientState} client - Game
 * @param {number} tile - Target
 * @param {boolean} isHeavy - Heavy missile, needs a high level silo
 * @return {ConcordatBuildingRow | null} - Silo
 */

export const siloFor = (
  client: ConcordatClientState,
  tile: number,
  isHeavy: boolean
): ConcordatBuildingRow | null => {
  let best: ConcordatBuildingRow | null = null
  let bestReach = Infinity

  for (const building of client.systems.buildings) {
    if (
      building.owner !== client.me ||
      building.kind !== ConcordatBuildingKinds.Silo ||
      building.readyAt > client.tick ||
      (isHeavy && building.level < weapons.heavyLevel)
    )
      continue
    const reach = reachOf(building.tile, tile, client.map.width)
    if (reach <= weapons.range && reach < bestReach) {
      best = building
      bestReach = reach
    }
  }

  return best
}

/**
 * Tick from which batteries and aircraft may work
 * @param {ConcordatClientState} client - Game
 * @return {number} - Tick
 */

export const airOpenAt = (client: ConcordatClientState): number =>
  client.pickEnd + ticksOf(air.unlockMinutes * 60)

/**
 * Nearest battery of mine that is loaded and reaches a tile
 * @param {ConcordatClientState} client - Game
 * @param {number} tile - Target
 * @return {ConcordatBuildingRow | null} - Battery
 */

export const batteryFor = (
  client: ConcordatClientState,
  tile: number
): ConcordatBuildingRow | null => {
  let best: ConcordatBuildingRow | null = null
  let bestReach = Infinity

  for (const building of client.systems.buildings) {
    if (
      building.owner !== client.me ||
      building.kind !== ConcordatBuildingKinds.Battery ||
      building.readyAt > client.tick
    )
      continue
    const reach = reachOf(building.tile, tile, client.map.width)
    const range = air.battery.range[Math.min(building.level, air.battery.range.length) - 1]
    if (reach <= range && reach < bestReach) {
      best = building
      bestReach = reach
    }
  }

  return best
}

/**
 * Airbase of mine that can send one more aircraft, null when the sky is full
 * @param {ConcordatClientState} client - Game
 * @param {number} tile - Target
 * @return {ConcordatBuildingRow | null} - Base
 */

export const baseFor = (
  client: ConcordatClientState,
  tile: number
): ConcordatBuildingRow | null => {
  const bases = client.systems.buildings.filter(
    (building) =>
      building.owner === client.me &&
      building.kind === ConcordatBuildingKinds.Airbase &&
      building.readyAt <= client.tick &&
      reachOf(building.tile, tile, client.map.width) <= air.range
  )
  const slots = bases.reduce((sum, base) => sum + base.level * air.slotsPerLevel, 0)
  const flying = client.systems.aircraft.filter((aircraft) => aircraft.owner === client.me).length

  return flying < slots ? (bases[0] ?? null) : null
}
