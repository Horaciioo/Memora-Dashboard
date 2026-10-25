import type { baccalaureatView } from '@/core/services/play/baccalaureat/BaccalaureatViewService'

// Board sent by the engine
export type BacBoardView = Awaited<ReturnType<typeof baccalaureatView>>

export type BacRoundView = NonNullable<BacBoardView['round']>

/**
 * Player at the table, as the board names them
 * @typedef {Object} BacPlayer
 */

export interface BacPlayer {
  accountId: string
  name: string
  avatarUrl: string | null
}

/**
 * Player with the points of the scored rounds
 * @typedef {Object} BacRanked
 */

export interface BacRanked extends BacPlayer {
  points: number
}

/**
 * Seconds left until a date, never below zero
 * @param {Date | string} to - Deadline
 * @param {number} now - Server now
 * @return {number} - Seconds
 */

export const secondsTo = (to: Date | string, now: number): number =>
  Math.max(0, Math.ceil((new Date(to).getTime() - now) / 1000))

/**
 * Totals of the scored rounds, best first
 * @param {BacBoardView['history']} history - Scored rounds
 * @param {BacPlayer[]} players - Table
 * @return {BacRanked[]} - Ranking
 */

export const rankPlayers = (history: BacBoardView['history'], players: BacPlayer[]): BacRanked[] =>
  players
    .map((player) => ({
      ...player,
      points: history.reduce((sum, round) => sum + (round.points[player.accountId] ?? 0), 0),
    }))
    .sort((left, right) => right.points - left.points)
