import { sideOf } from '@/core/lib/play/concordat/modes/rules'
import {
  dominantWinner,
  livingSides,
  scoreRows,
  sideScore,
} from '@/core/lib/play/concordat/victory'
import type { ConcordatState } from '@/types/concordat'
import { ConcordatPowers } from '@/utils/constants/concordat'

/**
 * Standing of one nation
 * @typedef {Object} ConcordatStanding
 */

export interface ConcordatStanding {
  playerId: number
  rank: number
  score: number
}

/**
 * Ranking: the winning side first, then survivors by side score, then the fallen by latest fall
 * @param {ConcordatState} state - Game
 * @return {ConcordatStanding[]} - Best first
 */

export const standingsOf = (state: ConcordatState): ConcordatStanding[] => {
  const rows = scoreRows(state)
  const sides = livingSides(state)
  const domination = dominantWinner(state)

  // Sort keys, best first: dominant side, living side, side score, living, own score, late fall
  const keysOf = (id: number): number[] => {
    const side = sideOf(state, id)
    const mine = state.players[id - 1]

    return [
      side === domination ? 0 : 1,
      sides.has(side) ? 0 : 1,
      -sideScore(state, rows, side),
      mine.alive ? 0 : 1,
      -rows[id - 1].total,
      -mine.eliminatedAt,
      id,
    ]
  }
  const ordered = [...state.players].sort((first, second) => {
    const left = keysOf(first.id)
    const right = keysOf(second.id)
    const index = left.findIndex((key, position) => key !== right[position])

    return index < 0 ? 0 : left[index] - right[index]
  })

  return ordered
    .filter((player) => player.kind === ConcordatPowers.Human)
    .map((player, index) => ({
      playerId: player.id,
      rank: index + 1,
      score: rows[player.id - 1].total,
    }))
}
