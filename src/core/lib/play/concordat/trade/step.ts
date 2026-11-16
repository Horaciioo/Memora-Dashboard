import { buildingById, isWorking } from '@/core/lib/play/concordat/buildings/rules'
import { tieKindOf } from '@/core/lib/play/concordat/diplomacy/ties'
import { linkAllies } from '@/core/lib/play/concordat/trade/open'
import { spawnCargo } from '@/core/lib/play/concordat/trade/ships'
import { tradeIncomeOf } from '@/core/lib/play/concordat/trade/income'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatRoute, ConcordatState } from '@/types/concordat'
import { ConcordatRouteKinds, ConcordatShipKinds, ConcordatTies } from '@/utils/constants/concordat'

const { trade, navy } = CONCORDAT
// One path tile in this many is checked for a blockade
const PATH_STEP = 4

// Both ends still stand and still belong to the parties
const isStanding = (state: ConcordatState, route: ConcordatRoute): boolean => {
  const first = buildingById(state, route.buildingA)
  const second = buildingById(state, route.buildingB)

  const isKept =
    !route.isAlliance || tieKindOf(state, route.a, route.b) === ConcordatTies.Alliance

  return Boolean(
    isKept &&
    first &&
    second &&
    first.owner === route.a &&
    second.owner === route.b &&
    isWorking(first, state.tick) &&
    isWorking(second, state.tick)
  )
}

// A warship of a nation at war with a party sits on the way
const isBlockaded = (state: ConcordatState, route: ConcordatRoute): boolean => {
  if (route.kind !== ConcordatRouteKinds.Sea) return false

  const { width } = state.map
  const warships = state.ships.filter((ship) => ship.kind === ConcordatShipKinds.War)
  for (let index = 0; index < route.path.length; index += PATH_STEP) {
    const tile = route.path[index]
    for (const ship of warships) {
      const isFoe =
        tieKindOf(state, ship.owner, route.a) === ConcordatTies.Hostile ||
        tieKindOf(state, ship.owner, route.b) === ConcordatTies.Hostile
      const dx = (ship.tile % width) - (tile % width)
      const dy = Math.floor(ship.tile / width) - Math.floor(tile / width)
      if (
        isFoe &&
        ship.owner !== route.a &&
        ship.owner !== route.b &&
        Math.hypot(dx, dy) <= navy.blockadeRadius + state.effects[ship.owner - 1].blockade
      )
        return true
    }
  }

  return false
}

// War between the parties or a blockade cuts a route
const isCut = (state: ConcordatState, route: ConcordatRoute): boolean =>
  tieKindOf(state, route.a, route.b) === ConcordatTies.Hostile || isBlockaded(state, route)

/**
 * Trade phase of a tick: routes checked now and then, income handed out
 * @param {ConcordatState} state - Game
 * @return {void}
 */

export const runTrade = (state: ConcordatState): void => {
  if (!CONCORDAT.features.trade) return
  spawnCargo(state)
  if (state.tick % trade.linkTicks === 0) linkAllies(state)
  if (state.tick % trade.checkTicks !== 0) return

  const kept = state.routes.filter((route) => isStanding(state, route))
  if (kept.length !== state.routes.length) {
    state.routes = kept
    state.isSystemsDirty = true
  }

  // A cut route starts its climb again when it reopens
  const cut = new Set<number>()
  for (const route of state.routes) {
    const isNowCut = isCut(state, route)
    if (isNowCut) {
      cut.add(route.id)
      route.since = state.tick
    }
    if (isNowCut !== route.isCut) {
      route.isCut = isNowCut
      state.isSystemsDirty = true
    }
  }
  for (const player of state.players) {
    state.effects[player.id - 1].trade = player.alive ? tradeIncomeOf(state, player.id, cut) : 0
  }
}
