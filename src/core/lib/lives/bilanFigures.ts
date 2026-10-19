import type { LiveInsights } from '@/core/lib/lives/insights'
import type { LiveReport } from '@/core/lib/lives/report'
import { BILAN_COPY } from '@/declarations/lives/bilan'
import { LIVE_REPORT_COPY } from '@/declarations/lives/moderation'
import { formatSpan } from '@/utils/format/modview'

/**
 * Key figures of a live, said
 * @typedef {Object} BilanFigure
 */

export interface BilanFigure {
  id: BilanFigureId
  label: string
  value: string
}

/**
 * Every figure of a bilan
 * @typedef {'duration' | 'actions' | 'perHour' | 'targets' | 'teamTime' | 'gap' | 'peak' | 'average' | 'per1000' | 'failure'} BilanFigureId
 */

export type BilanFigureId =
  | 'duration'
  | 'actions'
  | 'perHour'
  | 'targets'
  | 'teamTime'
  | 'gap'
  | 'peak'
  | 'average'
  | 'per1000'
  | 'failure'

// One decimal at most
const oneDecimal = (value: number): string => String(Math.round(value * 10) / 10)

/**
 * Figures shown over a Bilan
 * @param {LiveReport} report - Report
 * @param {LiveInsights} insights - Insights
 * @param {number} durationSeconds - Live length
 * @return {BilanFigure[]} - Figures
 */

export const bilanFigures = (
  report: LiveReport,
  insights: LiveInsights,
  durationSeconds: number
): BilanFigure[] => {
  const none = BILAN_COPY.none

  return [
    { id: 'duration', label: LIVE_REPORT_COPY.duration, value: formatSpan(durationSeconds) },
    { id: 'actions', label: LIVE_REPORT_COPY.actions, value: String(report.actions) },
    { id: 'perHour', label: BILAN_COPY.perHour, value: oneDecimal(insights.perHour) },
    { id: 'targets', label: LIVE_REPORT_COPY.targets, value: String(report.distinctTargets) },
    {
      id: 'teamTime',
      label: LIVE_REPORT_COPY.teamTime,
      value: formatSpan(report.teamActiveSeconds),
    },
    {
      id: 'gap',
      label: BILAN_COPY.gap,
      value:
        insights.gapSeconds === null
          ? none
          : BILAN_COPY.gapValue.replace('{seconds}', String(Math.round(insights.gapSeconds))),
    },
    {
      id: 'peak',
      label: BILAN_COPY.viewersPeak,
      value: insights.viewers ? String(insights.viewers.peak) : none,
    },
    {
      id: 'average',
      label: BILAN_COPY.viewersAverage,
      value: insights.viewers ? String(insights.viewers.average) : none,
    },
    {
      id: 'per1000',
      label: BILAN_COPY.per1000,
      value: insights.per1000Viewers === null ? none : oneDecimal(insights.per1000Viewers),
    },
    {
      id: 'failure',
      label: BILAN_COPY.failureRate,
      value: `${Math.round(insights.failureRate * 100)} %`,
    },
  ]
}
