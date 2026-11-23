import { HOUR_MS } from '@/utils/constants/time'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'

/**
 * Hour mark along the live
 * @typedef {Object} TimeTick
 * @property {number} percent - Place along the live
 * @property {string} at - ISO moment of the mark
 */

export interface TimeTick {
  percent: number
  at: string
}

/**
 * Round-hour marks inside a span, spaced so they never crowd
 * @param {number} start - Span start, epoch ms
 * @param {number} end - Span end, epoch ms
 * @return {TimeTick[]} - Marks left to right
 */

export const timeTicks = (start: number, end: number): TimeTick[] => {
  const span = Math.max(1, end - start)
  const step = Math.max(1, Math.ceil(span / HOUR_MS / LIVE_SETTINGS.timeTicksMax)) * HOUR_MS
  const ticks: TimeTick[] = []

  for (let at = Math.ceil(start / HOUR_MS) * HOUR_MS; at <= end; at += step) {
    ticks.push({ percent: ((at - start) / span) * 100, at: new Date(at).toISOString() })
  }

  return ticks
}
