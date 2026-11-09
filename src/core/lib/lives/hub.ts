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
