import type { PlayAdminDay } from '@/types/play'
import type { PlayGameName } from '@/utils/constants/play'

export interface PlayGameShare {
  game: PlayGameName
  count: number
  part: number
}

/**
 * Share of each game over some days, the most played first
 * @param {PlayAdminDay[]} days - Days of the period
 * @return {{ sum: number; rows: PlayGameShare[] }} - Games finished and share of each
 */

export const shareByGame = (days: PlayAdminDay[]): { sum: number; rows: PlayGameShare[] } => {
  const counts = new Map<PlayGameName, number>()

  for (const day of days) {
    for (const [game, count] of Object.entries(day.byGame) as [PlayGameName, number][]) {
      counts.set(game, (counts.get(game) ?? 0) + count)
    }
  }

  const sum = [...counts.values()].reduce((total, count) => total + count, 0)

  return {
    sum,
    rows: [...counts.entries()]
      .map(([game, count]) => ({ game, count, part: sum > 0 ? count / sum : 0 }))
      .toSorted((a, b) => b.count - a.count),
  }
}

/**
 * Busiest hour of the day
 * @param {number[]} hours - Games finished per hour
 * @return {number | null} - Hour, null when nothing was played
 */

export const peakHour = (hours: number[]): number | null => {
  const best = hours.reduce((top, value, index) => (value > hours[top] ? index : top), 0)

  return hours[best] > 0 ? best : null
}
