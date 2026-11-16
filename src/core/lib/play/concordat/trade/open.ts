import { isWorking } from '@/core/lib/play/concordat/buildings/rules'
import { isCondemned } from '@/core/lib/play/concordat/diplomacy/trust'
import { distanceBetween } from '@/core/lib/play/concordat/map'
import { seaAround, seaPath } from '@/core/lib/play/concordat/navy/path'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatBuilding, ConcordatRoute, ConcordatState } from '@/types/concordat'
import { ConcordatBuildingKinds, ConcordatRouteKinds } from '@/utils/constants/concordat'
import type { ConcordatRouteKind } from '@/utils/constants/concordat'

const { trade } = CONCORDAT

const KIND_OF: Record<ConcordatRouteKind, string> = {
  [ConcordatRouteKinds.Land]: ConcordatBuildingKinds.Market,
  [ConcordatRouteKinds.Sea]: ConcordatBuildingKinds.Port,
}

// Working buildings of a kind
const workingOf = (state: ConcordatState, owner: number, kind: string): ConcordatBuilding[] =>
  state.buildings.filter(
    (building) =>
      building.owner === owner && building.kind === kind && isWorking(building, state.tick)
  )

/**
 * Routes a nation holds
 * @param {ConcordatState} state - Game
 * @param {number} playerId - Nation
 * @return {ConcordatRoute[]} - Routes
 */

export const routesOf = (state: ConcordatState, playerId: number): ConcordatRoute[] =>
  state.routes.filter((route) => route.a === playerId || route.b === playerId)

// Best route of one shape between two nations that is not open yet
const bestRoute = (
  state: ConcordatState,
  first: number,
  second: number,
  kind: ConcordatRouteKind
): Omit<ConcordatRoute, 'id' | 'since'> | null => {
  const range = kind === ConcordatRouteKinds.Land ? trade.landRange : trade.seaRange
  const used = new Set(state.routes.flatMap((route) => [route.buildingA, route.buildingB]))
  let best: Omit<ConcordatRoute, 'id' | 'since'> | null = null
  let bestValue = 0

  for (const mine of workingOf(state, first, KIND_OF[kind])) {
    for (const theirs of workingOf(state, second, KIND_OF[kind])) {
      if (used.has(mine.id) || used.has(theirs.id)) continue

      const length = distanceBetween(mine.tile, theirs.tile, state.map.width)
      if (length > range) continue

      const path =
        kind === ConcordatRouteKinds.Sea
          ? seaPath(state.map, seaAround(state.map, mine.tile), seaAround(state.map, theirs.tile))
          : []
      if (!path) continue

      // Long routes pay more, within a cap
      const value =
        Math.min(length, trade.refDistance * trade.maxDistanceFactor) * (mine.level + theirs.level)
      if (value <= bestValue) continue
      bestValue = value
      best = {
        a: first,
        b: second,
        buildingA: mine.id,
        buildingB: theirs.id,
        kind,
        length,
        path,
        isCut: false,
      }
    }
  }

  return best
}

/**
 * Why trade cannot open between two nations, null when it can
 * @param {ConcordatState} state - Game
 * @param {number} first - Proposer
 * @param {number} second - Partner
 * @return {string | null} - Reason
 */

export const tradeRefusal = (
  state: ConcordatState,
  first: number,
  second: number
): string | null => {
  if (!CONCORDAT.features.trade) return 'featureOff'
  if (routesOf(state, first).length >= trade.maxRoutes) return 'tooManyRoutes'
  if (routesOf(state, second).length >= trade.maxRoutes) return 'partnerFull'
  if (state.players[first - 1].gold < routeCost(state, first, second)) return 'noGold'

  const hasRoute =
    bestRoute(state, first, second, ConcordatRouteKinds.Land) ||
    bestRoute(state, first, second, ConcordatRouteKinds.Sea)

  return hasRoute ? null : 'noRoute'
}

/**
 * Gold to open trade, dearer with a condemned partner
 * @param {ConcordatState} state - Game
 * @param {number} first - Proposer
 * @param {number} second - Partner
 * @return {number} - Gold
 */

export const routeCost = (state: ConcordatState, first: number, second: number): number =>
  trade.routeCost * (isCondemned(state, first) || isCondemned(state, second) ? 2 : 1)

/**
 * Open the best land route and the best sea route between two nations
 * @param {ConcordatState} state - Game
 * @param {number} first - Proposer, pays
 * @param {number} second - Partner
 * @return {boolean} - Something opened
 */

export const openTradeRoutes = (state: ConcordatState, first: number, second: number): boolean => {
  if (tradeRefusal(state, first, second)) return false

  let opened = 0
  for (const kind of Object.values(ConcordatRouteKinds)) {
    if (
      routesOf(state, first).length >= trade.maxRoutes ||
      routesOf(state, second).length >= trade.maxRoutes
    )
      break

    const route = bestRoute(state, first, second, kind)
    if (!route) continue

    state.routes.push({ ...route, id: state.nextId++, since: state.tick })
    opened++
  }
  if (!opened) return false

  state.players[first - 1].gold -= routeCost(state, first, second)
  state.isSystemsDirty = true

  return true
}
