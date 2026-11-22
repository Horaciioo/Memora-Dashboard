import { hasTreaty } from '@/core/lib/play/concordat/diplomacy/ties'
import { seaPath } from '@/core/lib/play/concordat/navy/path'
import { sailRoute, warRoute } from '@/core/lib/play/concordat/navy/route'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatIntent, ConcordatState } from '@/types/concordat'
import { ConcordatShipKinds, ConcordatTerrains } from '@/utils/constants/concordat'

const { navy, sim } = CONCORDAT

/**
 * Own warships of a nation
 * @param {ConcordatState} state - Game
 * @param {number} playerId - Nation
 * @return {number} - Count
 */

export const fleetOf = (state: ConcordatState, playerId: number): number =>
  state.ships.filter((ship) => ship.owner === playerId && ship.kind === ConcordatShipKinds.War)
    .length

/**
 * Why a warship cannot be bought, null when it can: it is a weapon, launched from the nearest own coast
 * @param {ConcordatState} state - Game
 * @param {Extract<ConcordatIntent, { kind: 'buildShip' }>} intent - Order
 * @return {string | null} - Reason
 */

export const buildShipRefusal = (
  state: ConcordatState,
  intent: Extract<ConcordatIntent, { kind: 'buildShip' }>
): string | null => {
  if (!CONCORDAT.features.navy) return 'featureOff'

  const { tile, playerId } = intent
  if (!Number.isInteger(tile) || tile < 0 || tile >= state.owner.length) return 'badTile'
  if (state.map.terrain[tile] !== ConcordatTerrains.Sea) return 'badTile'
  if (fleetOf(state, playerId) >= navy.maxWar + state.effects[playerId - 1].ships)
    return 'fleetFull'
  if (state.players[playerId - 1].provincesHeld < navy.warZones) return 'needsZones'
  if (state.players[playerId - 1].gold < navy.warCost) return 'noGold'

  return warRoute(state, playerId, tile) ? null : 'noWay'
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

  const me = state.players[intent.playerId - 1]
  const { tile } = intent
  if (!Number.isInteger(tile) || tile < 0 || tile >= state.owner.length) return 'badTile'
  if (state.map.terrain[tile] === ConcordatTerrains.Sea || state.owner[tile] === me.id)
    return 'badTile'
  if (!Number.isInteger(intent.percent) || intent.percent < 1 || intent.percent > 100)
    return 'badPercent'

  const holder = state.owner[tile] ? state.players[state.owner[tile] - 1] : null
  if (holder && (!holder.alive || state.tick < holder.protectedUntil)) return 'protected'
  if (holder && hasTreaty(state, me.id, holder.id)) return 'treaty'

  if (Math.floor((me.troops * intent.percent) / 100) < sim.minEngage) return 'tooFew'
  if (me.gold < navy.transportCost) return 'noGold'

  const inFlight = state.ships.filter(
    (ship) => ship.owner === me.id && ship.kind === ConcordatShipKinds.Transport
  ).length
  if (inFlight >= navy.maxTransports) return 'fleetFull'

  // No building needed, the nearest own coast sends it
  return sailRoute(state, me.id, tile) ? null : 'noWay'
}
