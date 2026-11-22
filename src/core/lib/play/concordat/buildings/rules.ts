import { priceOf, raisePriceOf } from '@/core/lib/play/concordat/buildings/price'
import { neighborsOf, NEIGHBOR_SLOTS } from '@/core/lib/play/concordat/map'
import { seaAround } from '@/core/lib/play/concordat/navy/path'
import { isTileBlocked } from '@/core/lib/play/concordat/zones/rules'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatBuilding, ConcordatState } from '@/types/concordat'
import { ConcordatTerrains } from '@/utils/constants/concordat'
import type { ConcordatBuildingKind } from '@/utils/constants/concordat'

const { buildings } = CONCORDAT
const near = new Int32Array(NEIGHBOR_SLOTS)

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

  return priceOf(kind, held)
}

/**
 * Gold to raise a building one level
 * @param {ConcordatState} state - Game
 * @param {ConcordatBuilding} building - Building
 * @return {number} - Gold
 */

export const upgradeCost = (state: ConcordatState, building: ConcordatBuilding): number =>
  raisePriceOf(
    building.kind,
    building.level,
    state.buildings.filter(
      (other) => other.owner === building.owner && other.kind === building.kind
    ).length
  )

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

// Own land tile touching the sea nearest to a tile, walking own land only
const shoreOf = (state: ConcordatState, playerId: number, tile: number): number => {
  const { width, height, terrain } = state.map
  const seen = new Set<number>([tile])
  let ring = [tile]

  for (let step = 0; step <= buildings.snapSteps && ring.length; step++) {
    const found = ring.find((other) => seaAround(state.map, other).length)
    if (found !== undefined) return found

    const next: number[] = []
    for (const current of ring) {
      const count = neighborsOf(current, width, height, near)
      for (let slot = 0; slot < count; slot++) {
        const side = near[slot]
        if (
          seen.has(side) ||
          state.owner[side] !== playerId ||
          terrain[side] === ConcordatTerrains.Sea
        )
          continue
        seen.add(side)
        next.push(side)
      }
    }
    ring = next
  }

  return tile
}

/**
 * Tile a build order lands on: a coastal building named on land near the shore slides to the nearest own shore tile
 * @param {ConcordatState} state - Game
 * @param {{ playerId: number, building: ConcordatBuildingKind, tile: number }} order - Build order
 * @return {number} - Tile
 */

export const placeTileOf = (
  state: ConcordatState,
  order: { playerId: number; building: ConcordatBuildingKind; tile: number }
): number => {
  const { playerId, building, tile } = order
  const isLand =
    Number.isInteger(tile) &&
    tile >= 0 &&
    tile < state.owner.length &&
    state.owner[tile] === playerId &&
    state.map.terrain[tile] !== ConcordatTerrains.Sea

  return isLand && kindOf(building)?.needsCoast ? shoreOf(state, playerId, tile) : tile
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
  if (kindOf(kind).needsCoast && !seaAround(state.map, tile).length) return 'needsCoast'
  const stack = buildingsAt(state, tile)
  if (stack.some((other) => other.kind !== kind)) return 'occupied'
  if (isTileBlocked(state, tile, 'blocksBuilding')) return 'fallout'
  if (state.players[playerId - 1].provincesHeld < CONCORDAT.merit.zones[kind]) return 'needsZones'
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

  return state.players[playerId - 1].gold < upgradeCost(state, building) ? 'noGold' : null
}
