import { LIVE_HUB } from '@/declarations/lives/hub'
import type { MemberLiveSummary } from '@/types/lives'

export type TrendDirection = 'up' | 'down' | 'flat'

export interface Trend {
  direction: TrendDirection
  // Share of the change, null when there was nothing to compare to
  percent: number | null
}

/**
 * Way a figure moved against the period before
 * @param {number} value - Latest period
 * @param {number} previous - Period before
 * @return {Trend} - Direction and share
 */

export const trendOf = (value: number, previous: number): Trend => {
  if (value === previous) return { direction: 'flat', percent: null }
  const direction = value > previous ? 'up' : 'down'
  if (previous === 0) return { direction, percent: null }

  return { direction, percent: Math.round((Math.abs(value - previous) / previous) * 100) }
}

export interface LiveHistoryFigures {
  sanctions: number
  messages: number
  time: number
}

/**
 * Recent Live figures
 * @param {Pick<MemberLiveSummary, 'kinds' | 'activeSeconds'>[]} lives - Moderated lives
 * @return {LiveHistoryFigures} - Aggregated figures
 */

export const historyFiguresOf = (
  lives: Pick<MemberLiveSummary, 'kinds' | 'activeSeconds'>[]
): LiveHistoryFigures =>
  lives.reduce(
    (figures, live) => {
      const messages = live.kinds.find((entry) => entry.kind === LIVE_HUB.messageKind)?.count ?? 0
      const gestures = live.kinds.reduce((sum, entry) => sum + entry.count, 0)

      return {
        sanctions: figures.sanctions + gestures - messages,
        messages: figures.messages + messages,
        time: figures.time + live.activeSeconds,
      }
    },
    { sanctions: 0, messages: 0, time: 0 }
  )
