import { reachOf } from '@/core/lib/play/concordat/sim/area'
import { ticksOf } from '@/core/lib/play/concordat/sim/tables'
import type { ConcordatClientState } from '@/core/lib/play/concordat/wire/board'
import type { ConcordatBuildingRow } from '@/core/lib/play/concordat/wire/systems'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import { ConcordatBuildingKinds } from '@/utils/constants/concordat'
import type { ConcordatBuildingKind } from '@/utils/constants/concordat'

const { buildings, weapons } = CONCORDAT

/**
 * Gold of a new building, each one held makes it dearer
 * @param {ConcordatClientState} client - Game
 * @param {ConcordatBuildingKind} kind - Kind
 * @return {number} - Gold
 */

export const buildCostOf = (client: ConcordatClientState, kind: ConcordatBuildingKind): number => {
  const held = client.systems.buildings.filter(
    (building) => building.owner === client.me && building.kind === kind
  ).length

  return Math.round(buildings.kinds[kind].cost * (1 + buildings.kinds[kind].step * held))
}

/**
 * Gold to raise a building one level, zero at the top
 * @param {ConcordatBuildingRow} building - Building
 * @return {number} - Gold
 */

export const upgradeCostOf = (building: ConcordatBuildingRow): number =>
  building.level >= buildings.kinds[building.kind].levels.length
    ? 0
    : Math.round(buildings.kinds[building.kind].cost * buildings.upgradeFactor * building.level)

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
