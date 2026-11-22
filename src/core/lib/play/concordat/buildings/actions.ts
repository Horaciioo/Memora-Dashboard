import {
  buildCost,
  kindOf,
  upgradeCost,
  buildingById,
} from '@/core/lib/play/concordat/buildings/rules'
import { emit } from '@/core/lib/play/concordat/sim/emit'
import { ticksOf } from '@/core/lib/play/concordat/sim/tables'
import type { ConcordatState } from '@/types/concordat'
import type { ConcordatBuildingKind } from '@/utils/constants/concordat'

/**
 * Raise a building, paid at once, working after its delay
 * @param {ConcordatState} state - Game
 * @param {number} playerId - Builder
 * @param {ConcordatBuildingKind} kind - Kind
 * @param {number} tile - Tile
 * @return {void}
 */

export const placeBuilding = (
  state: ConcordatState,
  playerId: number,
  kind: ConcordatBuildingKind,
  tile: number
): void => {
  state.players[playerId - 1].gold -= buildCost(state, playerId, kind)
  state.buildings.push({
    id: state.nextId++,
    owner: playerId,
    kind,
    level: 1,
    tile,
    readyAt: state.tick + ticksOf(kindOf(kind).buildSeconds),
  })
  state.isSystemsDirty = true
  emit(state, { tick: state.tick, kind: 'built', actor: playerId, victim: 0, tile })
}

/**
 * Raise a building one level, it works again after the delay
 * @param {ConcordatState} state - Game
 * @param {number} playerId - Owner
 * @param {number} id - Building
 * @return {void}
 */

export const upgradeBuilding = (state: ConcordatState, playerId: number, id: number): void => {
  const building = buildingById(state, id)
  if (!building) return

  state.players[playerId - 1].gold -= upgradeCost(state, building)
  building.level++
  building.readyAt = state.tick + ticksOf(kindOf(building.kind).buildSeconds)
  state.isSystemsDirty = true
  emit(state, { tick: state.tick, kind: 'built', actor: playerId, victim: 0, tile: building.tile })
}
