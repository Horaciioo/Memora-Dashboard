import { buildingById, isWorking } from '@/core/lib/play/concordat/buildings/rules'
import { hasTreaty } from '@/core/lib/play/concordat/diplomacy/ties'
import { distanceBetween } from '@/core/lib/play/concordat/map'
import { seaAround, seaPath } from '@/core/lib/play/concordat/navy/path'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatIntent, ConcordatState } from '@/types/concordat'
import {
  ConcordatBuildingKinds,
  ConcordatShipKinds,
  ConcordatTerrains,
} from '@/utils/constants/concordat'

const { navy, sim } = CONCORDAT

// Working port of the sender
const portOf = (state: ConcordatState, playerId: number, id: number) => {
  const port = buildingById(state, id)

  return port &&
    port.owner === playerId &&
    port.kind === ConcordatBuildingKinds.Port &&
    isWorking(port, state.tick)
    ? port
    : null
}

/**
 * Why a warship cannot be built, null when it can
 * @param {ConcordatState} state - Game
 * @param {Extract<ConcordatIntent, { kind: 'buildShip' }>} intent - Order
 * @return {string | null} - Reason
 */

export const buildShipRefusal = (
  state: ConcordatState,
  intent: Extract<ConcordatIntent, { kind: 'buildShip' }>
): string | null => {
  if (!CONCORDAT.features.navy) return 'featureOff'

  const port = portOf(state, intent.playerId, intent.port)
  if (!port) return 'noPort'

  const fleet = state.ships.filter(
    (ship) => ship.owner === intent.playerId && ship.kind === ConcordatShipKinds.War
  ).length
  if (fleet >= state.effects[intent.playerId - 1].ships) return 'fleetFull'
  if (state.players[intent.playerId - 1].provincesHeld < navy.warZones) return 'needsZones'
  if (!seaAround(state.map, port.tile).length) return 'noPort'

  return state.players[intent.playerId - 1].gold < navy.warCost ? 'noGold' : null
}

/**
 * Why a warship cannot move there, null when it can
 * @param {ConcordatState} state - Game
 * @param {Extract<ConcordatIntent, { kind: 'moveShip' }>} intent - Order
 * @return {string | null} - Reason
 */

export const moveShipRefusal = (
  state: ConcordatState,
  intent: Extract<ConcordatIntent, { kind: 'moveShip' }>
): string | null => {
  const ship = state.ships.find((other) => other.id === intent.ship)
  if (!ship || ship.owner !== intent.playerId || ship.kind !== ConcordatShipKinds.War)
    return 'noShip'
  if (state.map.terrain[intent.tile] !== ConcordatTerrains.Sea) return 'badTile'

  return seaPath(state.map, [ship.tile], [intent.tile]) ? null : 'noWay'
}

/**
 * Why a landing cannot sail, null when it can
 * @param {ConcordatState} state - Game
 * @param {Extract<ConcordatIntent, { kind: 'sail' }>} intent - Order
 * @return {string | null} - Reason
 */

export const sailRefusal = (
  state: ConcordatState,
  intent: Extract<ConcordatIntent, { kind: 'sail' }>
): string | null => {
  if (!CONCORDAT.features.navy) return 'featureOff'

  const port = portOf(state, intent.playerId, intent.port)
  if (!port) return 'noPort'

  const me = state.players[intent.playerId - 1]
  const { tile } = intent
  if (!Number.isInteger(tile) || tile < 0 || tile >= state.owner.length) return 'badTile'
  if (state.map.terrain[tile] === ConcordatTerrains.Sea || state.owner[tile] === me.id)
    return 'badTile'
  if (!Number.isInteger(intent.percent) || intent.percent < 1 || intent.percent > 100)
    return 'badPercent'

  const holder = state.owner[tile] ? state.players[state.owner[tile] - 1] : null
  if (
    holder &&
    (!holder.alive || state.tick < holder.protectedUntil || state.tick < me.protectedUntil)
  )
    return 'protected'
  if (holder && hasTreaty(state, me.id, holder.id)) return 'treaty'

  const distance = distanceBetween(port.tile, tile, state.map.width)
  if (distance < navy.minSail || distance > navy.sailRange) return 'outOfRange'
  if (Math.floor((me.troops * intent.percent) / 100) < sim.minEngage) return 'tooFew'
  if (me.gold < navy.transportCost) return 'noGold'

  const inFlight = state.ships.filter(
    (ship) => ship.port === port.id && ship.kind === ConcordatShipKinds.Transport
  ).length
  if (inFlight >= navy.maxTransports) return 'fleetFull'

  const way = seaPath(state.map, seaAround(state.map, port.tile), seaAround(state.map, tile))

  return way ? null : 'noWay'
}
