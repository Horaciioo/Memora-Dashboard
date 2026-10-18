import type { LiveBaseline, LiveInsights } from './types'

/**
 * One line of the comparison
 * @typedef {Object} BaselineRow
 * @property {'actions' | 'perHour' | 'duration' | 'viewers' | 'peak'} id - Figure
 * @property {number} current - This live
 * @property {number} baseline - Average before
 * @property {number | null} change - Ratio against the average
 */

export interface BaselineRow {
  id: 'actions' | 'perHour' | 'duration' | 'viewers' | 'peak'
  current: number
  baseline: number
  change: number | null
}

/**
 * Compare a live to the average before it
 * @param {Object} current - This live
 * @param {number} current.actions - Gestures
 * @param {number} current.durationSeconds - Length
 * @param {LiveInsights} insights - Insights
 * @param {LiveBaseline} baseline - Average before
 * @return {BaselineRow[]} - Rows
 */

export const compareToBaseline = (
  current: { actions: number; durationSeconds: number },
  insights: LiveInsights,
  baseline: LiveBaseline
): BaselineRow[] => {
  const row = (id: BaselineRow['id'], now: number | null, before: number | null) =>
    now === null || before === null
      ? []
      : [{ id, current: now, baseline: before, change: before > 0 ? now / before - 1 : null }]

  return [
    ...row('actions', current.actions, baseline.actions),
    ...row('perHour', insights.perHour, baseline.perHour),
    ...row('duration', current.durationSeconds, baseline.durationSeconds),
    ...row('viewers', insights.viewers?.average ?? null, baseline.averageViewers),
    ...row('peak', insights.viewers?.peak ?? null, baseline.peakViewers),
  ]
}
