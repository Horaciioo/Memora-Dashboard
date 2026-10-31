import { VERDICT_OUTCOMES } from '@/declarations/reference/fixed'
import type { RecruitmentOutcomeView } from '@/types/recruitment'
import type { MeMetrics, MetricDay, MetricTone } from '@/core/lib/recruitment/meMetrics'

// Dev preview only, shown with ?demo on the Me tab

/**
 * Stacked days from plain numbers
 * @param {number[][]} rows - One list of part values per day
 * @param {MetricTone[]} tones - Colour of each part
 * @return {MetricDay[]} - Seven days ending on the 20th
 */

const days = (rows: number[][], tones: MetricTone[]): MetricDay[] =>
  rows.map((values, index) => ({
    key: `2026-10-${14 + index}`,
    label: String(14 + index),
    parts: values.map((value, part) => ({ value, tone: tones[part]! })),
  }))

/**
 * Invented figures filling every card
 * @type {MeMetrics}
 */

export const DEMO_METRICS: MeMetrics = {
  interviews: 24,
  interviewDays: days([[2], [4], [3], [5], [1], [6], [3]], ['brand']),
  observations: 11,
  observationDays: days([[1], [0], [2], [3], [1], [2], [2]], ['info']),
  hours: 3.5,
  hourDays: days([[2], [4.5], [3], [5], [1.5], [6], [2.5]], ['caution']),
  accepted: 9,
  refused: 6,
  decisionDays: days(
    [
      [1, 0],
      [2, 1],
      [1, 1],
      [2, 2],
      [0, 1],
      [2, 1],
      [1, 0],
    ],
    ['success', 'danger']
  ),
  duo: {
    members: [
      { id: 'demo-me', label: 'Toi', accent: null },
      { id: 'demo-duo', label: 'Léa', accent: null },
    ],
    sessions: 4,
  },
}

// Counts handed to the verdict outcomes
const DEMO_VERDICTS = [9, 6, 3]

/**
 * Invented decisions over the verdict outcomes
 * @param {RecruitmentOutcomeView[]} outcomes - Outcomes of the session
 * @return {Record<string, number>} - Count per outcome
 */

export const demoVerdicts = (outcomes: RecruitmentOutcomeView[]): Record<string, number> =>
  Object.fromEntries(
    outcomes
      .filter((outcome) => VERDICT_OUTCOMES.includes(outcome.name))
      .map((outcome, index) => [outcome.id, DEMO_VERDICTS[index] ?? 0])
  )
