import { seaPath } from '@/core/lib/play/concordat/navy/path'
import { sailRoute, warRoute } from '@/core/lib/play/concordat/navy/route'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatIntent, ConcordatState } from '@/types/concordat'
import { ConcordatShipKinds } from '@/utils/constants/concordat'

const { navy } = CONCORDAT

/**
 * Buy a warship: it leaves the nearest own coast and sails to the aimed sea tile
 * @param {ConcordatState} state - Game
 * @param {Extract<ConcordatIntent, { kind: 'buildShip' }>} intent - Order
 * @return {void}
 */

export const buildShip = (
  state: ConcordatState,
  intent: Extract<ConcordatIntent, { kind: 'buildShip' }>
): void => {
  const way = warRoute(state, intent.playerId, intent.tile)
  if (!way) return

  state.players[intent.playerId - 1].gold -= navy.warCost
  state.ships.push({
    id: state.nextId++,
    owner: intent.playerId,
    kind: ConcordatShipKinds.War,
    tile: way[0],
    path: way.slice(1),
    troops: 0,
    landing: -1,
    ttl: 0,
    port: 0,
    progress: 0,
    hp: navy.warHp,
    kills: 0,
    vet: 0,
  })
  state.isSystemsDirty = true
}

/**
 * Send a warship across the water
 * @param {ConcordatState} state - Game
 * @param {Extract<ConcordatIntent, { kind: 'moveShip' }>} intent - Order
 * @return {void}
 */

export const moveShip = (
  state: ConcordatState,
  intent: Extract<ConcordatIntent, { kind: 'moveShip' }>
): void => {
  const ship = state.ships.find((other) => other.id === intent.ship)
  const way = ship && seaPath(state.map, [ship.tile], [intent.tile])
  if (!ship || !way) return

  ship.path = way.slice(1)
  ship.progress = 0
}

/**
 * Load troops on a transport and let it sail
 * @param {ConcordatState} state - Game
 * @param {Extract<ConcordatIntent, { kind: 'sail' }>} intent - Order
 * @return {void}
 */

export const sail = (
  state: ConcordatState,
  intent: Extract<ConcordatIntent, { kind: 'sail' }>
): void => {
  const me = state.players[intent.playerId - 1]
  const route = sailRoute(state, me.id, intent.tile)
  if (!route) return

  const troops = Math.floor((me.troops * intent.percent) / 100)
  me.troops -= troops
  me.gold -= navy.transportCost
  state.ships.push({
    id: state.nextId++,
    owner: me.id,
    kind: ConcordatShipKinds.Transport,
    tile: route.way[0],
    path: route.way.slice(1),
    troops,
    landing: route.landing,
    ttl: 0,
    port: 0,
    progress: 0,
  })
  state.isSystemsDirty = true
}
