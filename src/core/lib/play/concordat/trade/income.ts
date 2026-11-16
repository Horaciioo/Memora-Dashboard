import { buildingById } from '@/core/lib/play/concordat/buildings/rules'
import { isCondemned } from '@/core/lib/play/concordat/diplomacy/trust'
import { grossOf } from '@/core/lib/play/concordat/sim/economy'
import { ticksOf } from '@/core/lib/play/concordat/sim/tables'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatRoute, ConcordatState } from '@/types/concordat'

const { trade } = CONCORDAT

/**
 * Gold per second of one open route, for each of its two parties
 * @param {ConcordatState} state - Game
 * @param {ConcordatRoute} route - Route
 * @return {number} - Gold per second
 */

export const routeIncome = (state: ConcordatState, route: ConcordatRoute): number => {
  const first = buildingById(state, route.buildingA)
  const second = buildingById(state, route.buildingB)
  if (!first || !second) return 0

  // Climbs with the time the route stays open
  const age = Math.min(1, (state.tick - route.since) / ticksOf(trade.rampSeconds))
  const ramp = trade.rampStart + (1 - trade.rampStart) * age
  const reach = Math.min(route.length / trade.refDistance, trade.maxDistanceFactor)
  const weight = Math.sqrt(first.level * second.level)
  const isCondemnedParty = isCondemned(state, route.a) || isCondemned(state, route.b)

  const ally = route.isAlliance ? 1 + trade.allyBonus : 1

  return (
    trade.base * reach * weight * ramp * ally * (isCondemnedParty ? 1 - trade.condemnedMalus : 1)
  )
}

/**
 * Trade income of a nation, held under a share of its land income
 * @param {ConcordatState} state - Game
 * @param {number} playerId - Nation
 * @param {Set<number>} cut - Routes cut by war or blockade
 * @return {number} - Gold per second
 */

export const tradeIncomeOf = (
  state: ConcordatState,
  playerId: number,
  cut: Set<number>
): number => {
  let sum = 0
  for (const route of state.routes) {
    if ((route.a === playerId || route.b === playerId) && !cut.has(route.id)) {
      sum += routeIncome(state, route)
    }
  }
  const cap = trade.capShare * grossOf(state.players[playerId - 1]) + trade.capFloor

  return Math.min(sum, cap)
}

/**
 * Trade income of every nation in one pass over the routes, index is the id minus one
 * @param {ConcordatState} state - Game
 * @param {Set<number>} cut - Routes cut by war or blockade
 * @return {number[]} - Gold per second
 */

export const tradeIncomesOf = (state: ConcordatState, cut: Set<number>): number[] => {
  const sums = new Array<number>(state.players.length).fill(0)
  for (const route of state.routes) {
    if (cut.has(route.id)) continue

    const income = routeIncome(state, route)
    sums[route.a - 1] += income
    if (route.b !== route.a) sums[route.b - 1] += income
  }

  return sums.map((sum, index) => {
    const player = state.players[index]

    return player.alive ? Math.min(sum, trade.capShare * grossOf(player) + trade.capFloor) : 0
  })
}
