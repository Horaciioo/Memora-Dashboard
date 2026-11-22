import { alliesOf } from '@/core/lib/play/concordat/diplomacy/ties'
import { sideOf } from '@/core/lib/play/concordat/modes/rules'
import { grossOf } from '@/core/lib/play/concordat/sim/economy'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatState } from '@/types/concordat'

const { victory, sim } = CONCORDAT

/**
 * Score of a nation in its three columns, shares of the whole table out of 100
 * @typedef {Object} ConcordatScoreRow
 */

export interface ConcordatScoreRow {
  playerId: number
  territory: number
  economy: number
  achievements: number
  total: number
}

// Rare provinces a nation holds
const rareHeld = (state: ConcordatState, playerId: number): number => {
  const stride = state.map.provinces.length + 1

  return state.map.provinces.filter(
    (province) =>
      (victory.rare as string[]).includes(province.resource) &&
      state.provinceCounts[playerId * stride + province.id] >=
        Math.ceil(province.tiles * sim.provinceHeldShare)
  ).length
}

// Points for what a nation built and kept
const achievementsOf = (state: ConcordatState, playerId: number): number => {
  const mine = state.players[playerId - 1]
  const routes = state.routes.filter((route) => route.a === playerId || route.b === playerId).length

  return (
    (mine.alive && mine.capital >= 0 ? victory.achievements.capital : 0) +
    alliesOf(state, playerId).length * victory.achievements.alliance +
    routes * victory.achievements.route +
    rareHeld(state, playerId) * victory.achievements.rare
  )
}

// Value of each nation as a share of the sum
const sharesOf = (values: number[]): number[] => {
  const sum = values.reduce((total, value) => total + value, 0)

  return values.map((value) => (sum > 0 ? (value / sum) * 100 : 0))
}

/**
 * Scores of every nation: territory, economy, achievements
 * @param {ConcordatState} state - Game
 * @return {ConcordatScoreRow[]} - One row per nation, in id order
 */

export const scoreRows = (state: ConcordatState): ConcordatScoreRow[] => {
  const living = (value: (id: number) => number): number[] =>
    state.players.map((player) => (player.alive ? value(player.id) : 0))

  const territory = sharesOf(
    living((id) => {
      const mine = state.players[id - 1]

      return mine.tiles * CONCORDAT.score.perTile
    })
  )
  const economy = sharesOf(
    living(
      (id) =>
        grossOf(state.players[id - 1]) + state.effects[id - 1].gold + state.effects[id - 1].trade
    )
  )
  const achievements = sharesOf(living((id) => achievementsOf(state, id)))
  const { weights } = victory
  const sum = weights.territory + weights.economy + weights.achievements

  return state.players.map((player, index) => ({
    playerId: player.id,
    territory: Math.round(territory[index]),
    economy: Math.round(economy[index]),
    achievements: Math.round(achievements[index]),
    total: Math.round(
      (territory[index] * weights.territory +
        economy[index] * weights.economy +
        achievements[index] * weights.achievements) /
        sum
    ),
  }))
}

/**
 * Score of a side, the sum of its living nations
 * @param {ConcordatState} state - Game
 * @param {ConcordatScoreRow[]} rows - Rows
 * @param {number} side - Side key
 * @return {number} - Score
 */

export const sideScore = (state: ConcordatState, rows: ConcordatScoreRow[], side: number): number =>
  rows
    .filter((row) => sideOf(state, row.playerId) === side)
    .reduce((sum, row) => sum + row.total, 0)
