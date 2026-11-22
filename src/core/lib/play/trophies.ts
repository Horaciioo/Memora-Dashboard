import { PLAY_TROPHIES, TROPHY_REGULAR_PLAYED } from '@/declarations/play/trophies'
import type { PlayTrophy } from '@/declarations/play/trophies'
import type { PlayGameName } from '@/utils/constants/play'

/**
 * Counters of one game, as stored
 * @typedef {Object} TrophyGameRow
 */

export interface TrophyGameRow {
  game: PlayGameName
  played: number
  wins: number
  draws: number
  losses: number
  abandons: number
  bestStreak: number
  playSeconds: number
  tournamentsPlayed: number
  tournamentsWon: number
  extra: unknown
}

// Totals summed over the games
const SUMMED = [
  'played',
  'wins',
  'draws',
  'losses',
  'abandons',
  'playSeconds',
  'tournamentsPlayed',
  'tournamentsWon',
] as const

/**
 * Every counter a trophy can watch
 * @param {TrophyGameRow[]} rows - One row per game played
 * @return {Record<string, number>} - Value per counter key
 */

export const trophyCountersOf = (rows: TrophyGameRow[]): Record<string, number> => {
  const counters: Record<string, number> = {
    bestStreak: Math.max(0, ...rows.map((row) => row.bestStreak)),
    gamesTried: rows.filter((row) => row.played > 0).length,
    gamesWon: rows.filter((row) => row.wins > 0).length,
    gamesRegular: rows.filter((row) => row.played >= TROPHY_REGULAR_PLAYED).length,
  }

  for (const field of SUMMED) counters[field] = rows.reduce((total, row) => total + row[field], 0)

  for (const row of rows) {
    counters[`played:${row.game}`] = row.played
    counters[`wins:${row.game}`] = row.wins
    for (const [key, value] of Object.entries((row.extra ?? {}) as Record<string, number>))
      counters[`extra:${key}:${row.game}`] = value
  }

  return counters
}

/**
 * Trophy with its progress
 * @typedef {PlayTrophy} PlayTrophyProgress
 * @property {number} value - Counter now
 * @property {number} share - Progress between 0 and 1
 * @property {boolean} reached - Target met
 */

export interface PlayTrophyProgress extends PlayTrophy {
  value: number
  share: number
  reached: boolean
}

/**
 * Trophies with their progress
 * @param {TrophyGameRow[]} rows - Stats per game
 * @return {PlayTrophyProgress[]} - Trophies, share and reached flag
 */

export const trophiesOf = (rows: TrophyGameRow[]): PlayTrophyProgress[] => {
  const counters = trophyCountersOf(rows)

  return PLAY_TROPHIES.map((trophy) => {
    const value = counters[trophy.stat] ?? 0

    return {
      ...trophy,
      value: Math.min(value, trophy.target),
      share: Math.min(1, value / trophy.target),
      reached: value >= trophy.target,
    }
  })
}

/**
 * Trophies still to win, closest first, secret ones stay out
 * @param {TrophyGameRow[]} rows - Stats per game
 * @param {number} count - How many
 * @return {PlayTrophyProgress[]} - Closest trophies
 */

export const nextTrophies = (rows: TrophyGameRow[], count: number): PlayTrophyProgress[] =>
  trophiesOf(rows)
    .filter((trophy) => !trophy.reached && !trophy.hint)
    .sort((left, right) => right.share - left.share)
    .slice(0, count)
