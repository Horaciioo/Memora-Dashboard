import { isTileBlocked } from '@/core/lib/play/concordat/zones/rules'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatBuilding, ConcordatState } from '@/types/concordat'
import { ConcordatTerrains } from '@/utils/constants/concordat'
import type { ConcordatBuildingKind } from '@/utils/constants/concordat'

const { buildings } = CONCORDAT

/**
 * Settings of a building kind
 * @param {ConcordatBuildingKind} kind - Kind
 * @return {typeof buildings.kinds.market} - Settings
 */

export const kindOf = (kind: ConcordatBuildingKind) => buildings.kinds[kind]

/**
 * Highest level of a kind
 * @param {ConcordatBuildingKind} kind - Kind
 * @return {number} - Level
 */

export const maxLevelOf = (kind: ConcordatBuildingKind): number => kindOf(kind).levels.length

/**
 * Building standing on a tile
 * @param {ConcordatState} state - Game
 * @param {number} tile - Tile
 * @return {ConcordatBuilding | undefined} - Building
 */

export const buildingAt = (state: ConcordatState, tile: number): ConcordatBuilding | undefined =>
  state.buildings.find((building) => building.tile === tile)

/**
 * Every building stacked on a tile
 * @param {ConcordatState} state - Game
 * @param {number} tile - Tile
 * @return {ConcordatBuilding[]} - Buildings
 */

export const buildingsAt = (state: ConcordatState, tile: number): ConcordatBuilding[] =>
  state.buildings.filter((building) => building.tile === tile)

/**
 * Building by id
 * @param {ConcordatState} state - Game
 * @param {number} id - Building
 * @return {ConcordatBuilding | undefined} - Building
 */

export const buildingById = (state: ConcordatState, id: number): ConcordatBuilding | undefined =>
  state.buildings.find((building) => building.id === id)

/**
 * Does the building work now
 * @param {ConcordatBuilding} building - Building
 * @param {number} tick - Clock
 * @return {boolean} - Built and repaired
 */

export const isWorking = (building: ConcordatBuilding, tick: number): boolean =>
  building.readyAt <= tick

/**
 * Gold to raise a new building, each one already held makes it dearer
 * @param {ConcordatState} state - Game
 * @param {number} playerId - Owner
 * @param {ConcordatBuildingKind} kind - Kind
 * @return {number} - Gold
 */

export const buildCost = (
  state: ConcordatState,
  playerId: number,
  kind: ConcordatBuildingKind
): number => {
  const held = state.buildings.filter(
    (building) => building.owner === playerId && building.kind === kind
  ).length

  return Math.round(kindOf(kind).cost * (1 + kindOf(kind).step * held))
}

/**
 * Gold to raise a building one level
 * @param {ConcordatBuilding} building - Building
 * @return {number} - Gold
 */

export const upgradeCost = (building: ConcordatBuilding): number =>
  Math.round(kindOf(building.kind).cost * buildings.upgradeFactor * building.level)

// Tiles near another building of the same kind
const isCrowded = (state: ConcordatState, kind: ConcordatBuildingKind, tile: number): boolean => {
  const { width } = state.map
  const x = tile % width
  const y = Math.floor(tile / width)

  return state.buildings.some(
    (other) =>
      other.kind === kind &&
      other.tile !== tile &&
      Math.max(Math.abs((other.tile % width) - x), Math.abs(Math.floor(other.tile / width) - y)) <
        buildings.minGap
  )
}

// Spots held in the province of a tile, a stack is one spot
const inProvince = (state: ConcordatState, playerId: number, tile: number): Set<number> => {
  const province = state.map.province[tile]

  return new Set(
    state.buildings
      .filter(
        (building) => building.owner === playerId && state.map.province[building.tile] === province
      )
      .map((building) => building.tile)
  )
}

/**
 * Why a building cannot go there, null when it can
 * @param {ConcordatState} state - Game
 * @param {number} playerId - Builder
 * @param {ConcordatBuildingKind} kind - Kind
 * @param {number} tile - Tile
 * @return {string | null} - Reason
 */

export const placeRefusal = (
  state: ConcordatState,
  playerId: number,
  kind: ConcordatBuildingKind,
  tile: number
): string | null => {
  if (!CONCORDAT.features.buildings) return 'featureOff'
  if (!kindOf(kind)) return 'badKind'
  if (!Number.isInteger(tile) || tile < 0 || tile >= state.owner.length) return 'badTile'
  if (state.owner[tile] !== playerId) return 'notYours'

  const terrain = state.map.terrain[tile]
  if (terrain === ConcordatTerrains.Sea) return 'badTerrain'
  if (kindOf(kind).needsCoast && terrain !== ConcordatTerrains.Coast) return 'needsCoast'
  const stack = buildingsAt(state, tile)
  if (stack.some((other) => other.kind !== kind)) return 'occupied'
  if (stack.length >= buildings.maxStack) return 'stackFull'
  if (isTileBlocked(state, tile, 'blocksBuilding')) return 'fallout'
  if (state.players[playerId - 1].provincesHeld < CONCORDAT.merit.zones[kind]) return 'needsZones'
  if (
    state.buildings.filter((building) => building.owner === playerId).length >= buildings.maxTotal
  )
    return 'tooMany'
  const spots = inProvince(state, playerId, tile)
  if (!spots.has(tile) && spots.size >= buildings.maxPerProvince) return 'provinceFull'
  if (isCrowded(state, kind, tile)) return 'tooClose'

  return state.players[playerId - 1].gold < buildCost(state, playerId, kind) ? 'noGold' : null
}

/**
 * Why a building cannot rise a level, null when it can
 * @param {ConcordatState} state - Game
 * @param {number} playerId - Owner
 * @param {number} id - Building
 * @return {string | null} - Reason
 */

export const upgradeRefusal = (
  state: ConcordatState,
  playerId: number,
  id: number
): string | null => {
  if (!CONCORDAT.features.buildings) return 'featureOff'

  const building = buildingById(state, id)
  if (!building || building.owner !== playerId) return 'notYours'
  if (building.readyAt > state.tick) return 'notReady'
  if (building.level >= maxLevelOf(building.kind)) return 'maxLevel'

  return state.players[playerId - 1].gold < upgradeCost(building) ? 'noGold' : null
}
