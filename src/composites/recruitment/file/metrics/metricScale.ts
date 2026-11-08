import type { MetricDay, MetricTone } from '@/core/lib/recruitment/meMetrics'

// Graphic fill of each part
export const METRIC_TONES: Record<MetricTone, string> = {
  brand: 'var(--color-brand-500)',
  info: 'var(--color-sky-500)',
  caution: 'var(--color-ring-caution)',
  success: 'var(--color-ring-success)',
  danger: 'var(--color-ring-danger)',
}

// Round steps between two gridlines, the scale ends on twice the one that fits
const STEPS = [1, 2, 5, 10, 20, 50, 100]
export const GRID_LINES = 2

/**
 * Value shown on a chart, decimals only when there are some
 * @param {number} value - Figure of a day
 * @return {string} - Text to print
 */

export const printed = (value: number): string => String(Math.round(value * 10) / 10)

/**
 * Sum of the parts of each day
 * @param {MetricDay[]} days - Days of a chart
 * @return {number[]} - One total per day
 */

export const totalsOf = (days: MetricDay[]): number[] =>
  days.map((day) => day.parts.reduce((sum, part) => sum + part.value, 0))

/**
 * Round top of a scale holding a figure
 * @param {number} tallest - Biggest figure to draw
 * @return {{ step: number, top: number }} - Gap between lines and the scale end
 */

export const scaleOf = (tallest: number): { step: number; top: number } => {
  const step = STEPS.find((candidate) => candidate * GRID_LINES >= tallest) ?? tallest

  return { step, top: step * GRID_LINES }
}

/**
 * Colour slot of a day's first part
 * @param {MetricDay[]} days - Days of a chart
 * @return {MetricTone} - Tone carrying the chart
 */

export const leadTone = (days: MetricDay[]): MetricTone =>
  days.find((day) => day.parts.length > 0)?.parts[0]!.tone ?? 'brand'
