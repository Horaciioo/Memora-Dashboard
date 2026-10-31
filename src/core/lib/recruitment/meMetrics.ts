import { MONTH_LABELS } from '@/declarations/ui/dates'
import { RECRUITMENT_SETTINGS } from '@/declarations/configurations/recruitment'
import { OutcomeNames } from '@/declarations/reference/fixed'
import type { CandidateView, RecruitmentOutcomeView, RecruitmentRef } from '@/types/recruitment'
import { formatDayKey } from '@/utils/format/days'

const MINUTE_MS = 60_000
const HOUR_MINUTES = 60

// Days drawn in each chart
const CHART_DAYS = 7

/**
 * One day of a chart, a column cut in coloured parts
 * @typedef {Object} MetricDay
 * @property {string} key - Local day key
 * @property {string} label - Day and month, short
 * @property {{ value: number, tone: string }[]} parts - Stacked values
 */

export interface MetricDay {
  key: string
  label: string
  parts: { value: number; tone: MetricTone }[]
}

// Colour slot of a chart part
export type MetricTone = 'brand' | 'info' | 'caution' | 'success' | 'danger'

/**
 * Pair seen most often side by side
 * @typedef {Object} FavoriteDuo
 * @property {RecruitmentRef[]} members - The two moderators
 * @property {number} sessions - Sessions they shared
 */

export interface FavoriteDuo {
  members: RecruitmentRef[]
  sessions: number
}

/**
 * Figures shown on the Me tab
 * @typedef {Object} MeMetrics
 * @property {number} interviews - Interviews led
 * @property {MetricDay[]} interviewDays - Led per day
 * @property {number} observations - Interviews observed
 * @property {MetricDay[]} observationDays - Observed per day
 * @property {number | null} hours - Average hours on a working day
 * @property {MetricDay[]} hourDays - Hours per day
 * @property {number} accepted - Candidates accepted
 * @property {number} refused - Candidates refused
 * @property {MetricDay[]} decisionDays - Accepted and refused per day
 * @property {FavoriteDuo | null} duo - Favourite pair
 */

export interface MeMetrics {
  interviews: number
  interviewDays: MetricDay[]
  observations: number
  observationDays: MetricDay[]
  hours: number | null
  hourDays: MetricDay[]
  accepted: number
  refused: number
  decisionDays: MetricDay[]
  duo: FavoriteDuo | null
}

/**
 * Short day and month of a day key
 * @param {string} key - Local day key, year-month-day
 * @return {string} - Like 25 oct.
 */

const dayLabel = (key: string): string =>
  `${Number(key.slice(-2))} ${MONTH_LABELS[Number(key.slice(5, 7)) - 1]}`

/**
 * Last days of a series, one column each
 * @param {CandidateView[]} candidates - Interviews to range
 * @param {(candidate: CandidateView) => MetricDay['parts']} partsOf - Stack of one interview
 * @return {MetricDay[]} - Days in order, parts summed
 */

const rangeDays = (
  candidates: CandidateView[],
  partsOf: (candidate: CandidateView) => MetricDay['parts']
): MetricDay[] => {
  const days = new Map<string, MetricDay>()

  for (const candidate of candidates) {
    if (!candidate.interviewAt) continue

    const key = formatDayKey(candidate.interviewAt)
    const day = days.get(key) ?? { key, label: dayLabel(key), parts: [] }

    for (const part of partsOf(candidate)) {
      const same = day.parts.find((entry) => entry.tone === part.tone)
      if (same) same.value += part.value
      else day.parts.push({ ...part })
    }
    days.set(key, day)
  }

  return [...days.values()].sort((a, b) => a.key.localeCompare(b.key)).slice(-CHART_DAYS)
}

/**
 * Minutes an interview took
 * @param {CandidateView} candidate - Interview
 * @return {number} - Measured length, else the planned one
 */

const interviewMinutes = (candidate: CandidateView): number => {
  if (candidate.interviewStartedAt && candidate.verdictAt) {
    return (
      (new Date(candidate.verdictAt).getTime() - new Date(candidate.interviewStartedAt).getTime()) /
      MINUTE_MS
    )
  }

  return RECRUITMENT_SETTINGS.interviewMinutes
}

/**
 * Moderator seen most often beside the viewer
 * @param {CandidateView[]} seats - Interviews the viewer sat on
 * @param {string} viewerId - Member identifier
 * @return {FavoriteDuo | null} - Pair, null when always alone
 */

const favoriteDuo = (seats: CandidateView[], viewerId: string): FavoriteDuo | null => {
  const shared = new Map<string, { member: RecruitmentRef; count: number }>()
  let viewer: RecruitmentRef | undefined

  for (const candidate of seats) {
    const people = [...candidate.recruiters, ...candidate.observers]
    viewer ??= people.find((member) => member.id === viewerId)

    for (const member of people.filter((entry) => entry.id !== viewerId)) {
      const known = shared.get(member.id) ?? { member, count: 0 }
      known.count += 1
      shared.set(member.id, known)
    }
  }

  const best = [...shared.values()].sort((a, b) => b.count - a.count)[0]
  if (!viewer || !best) return null

  // One session loaded here, past sessions join once they are kept
  return { members: [viewer, best.member], sessions: 1 }
}

/**
 * Figures of the viewer over the session
 * @param {CandidateView[]} led - Interviews led
 * @param {CandidateView[]} watched - Interviews observed
 * @param {RecruitmentOutcomeView[]} outcomes - Outcomes of the session
 * @param {string} viewerId - Member identifier
 * @return {MeMetrics} - Counts and charts
 */

export const meMetrics = (
  led: CandidateView[],
  watched: CandidateView[],
  outcomes: RecruitmentOutcomeView[],
  viewerId: string
): MeMetrics => {
  const nameOf = (candidate: CandidateView) =>
    outcomes.find((outcome) => outcome.id === candidate.outcomeId)?.name
  const done = led.filter((candidate) => candidate.verdictAt !== null)
  const seen = watched.filter((candidate) => candidate.verdictAt !== null)
  const accepted = led.filter((candidate) => nameOf(candidate) === OutcomeNames.Accepted)
  const refused = led.filter((candidate) => nameOf(candidate) === OutcomeNames.Refused)

  // Hours of a candidate sat in, once
  const sat = [...new Map([...done, ...seen].map((entry) => [entry.id, entry])).values()]
  const hourDays = rangeDays(sat, (candidate) => [
    { value: interviewMinutes(candidate) / HOUR_MINUTES, tone: 'caution' },
  ])
  const hourTotal = hourDays.reduce((sum, day) => sum + day.parts[0]!.value, 0)

  return {
    interviews: done.length,
    interviewDays: rangeDays(done, () => [{ value: 1, tone: 'brand' }]),
    observations: seen.length,
    observationDays: rangeDays(seen, () => [{ value: 1, tone: 'info' }]),
    hours: hourDays.length > 0 ? hourTotal / hourDays.length : null,
    hourDays,
    accepted: accepted.length,
    refused: refused.length,
    decisionDays: rangeDays([...accepted, ...refused], (candidate) => [
      {
        value: 1,
        tone: nameOf(candidate) === OutcomeNames.Accepted ? 'success' : 'danger',
      },
    ]),
    duo: favoriteDuo([...led, ...watched], viewerId),
  }
}
