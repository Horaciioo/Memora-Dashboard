import { buildingById } from '@/core/lib/play/concordat/buildings/rules'
import { seaAround, seaPath } from '@/core/lib/play/concordat/navy/path'
import { sailRoute } from '@/core/lib/play/concordat/navy/route'
import { ticksOf } from '@/core/lib/play/concordat/sim/tables'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatIntent, ConcordatState } from '@/types/concordat'
import { ConcordatShipKinds } from '@/utils/constants/concordat'

const { navy } = CONCORDAT

/**
 * Launch a warship from a port
 * @param {ConcordatState} state - Game
 * @param {Extract<ConcordatIntent, { kind: 'buildShip' }>} intent - Order
 * @return {void}
 */

export const buildShip = (
  state: ConcordatState,
  intent: Extract<ConcordatIntent, { kind: 'buildShip' }>
): void => {
  const port = buildingById(state, intent.port)
  if (!port) return

  state.players[intent.playerId - 1].gold -= navy.warCost
  state.ships.push({
    id: state.nextId++,
    owner: intent.playerId,
    kind: ConcordatShipKinds.War,
    tile: seaAround(state.map, port.tile)[0],
    path: [],
    troops: 0,
    landing: -1,
    ttl: ticksOf(navy.orphanSeconds),
    port: port.id,
    progress: 0,
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
  const way = sailRoute(state, me.id, intent.tile)?.way
  if (!way) return

  const troops = Math.floor((me.troops * intent.percent) / 100)
  me.troops -= troops
  me.gold -= navy.transportCost
  state.ships.push({
    id: state.nextId++,
    owner: me.id,
    kind: ConcordatShipKinds.Transport,
    tile: way[0],
    path: way.slice(1),
    troops,
    landing: intent.tile,
    ttl: 0,
    port: 0,
    progress: 0,
  })
  state.isSystemsDirty = true
}
