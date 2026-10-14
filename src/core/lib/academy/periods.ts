import type { MilestoneState } from '@/core/lib/academy/parkourTimeline'
import type { PimPeriodName } from '@/declarations/academy/timeline'
import { AcademyStages, ReviewAdvices, ReviewStatuses } from '@/utils/constants/hierarchy'
import type {
  AcademyStageName,
  ReviewAdviceName,
  ReviewStatusName,
} from '@/utils/constants/hierarchy'

/**
 * Periods that carry dates
 * @typedef {'periodOne' | 'periodTwo' | 'periodThree'} DatedPeriodName
 */

export type DatedPeriodName = Extract<PimPeriodName, 'periodOne' | 'periodTwo' | 'periodThree'>

/**
 * Check-in as the periods read it
 * @typedef {Object} PeriodReview
 * @property {AcademyStageName} stage - Stage held for
 * @property {ReviewStatusName} status - Lifecycle
 * @property {ReviewAdviceName | null} decision - Outcome kept
 * @property {Date | null} decidedAt - Moment it was decided
 */

export interface PeriodReview {
  stage: AcademyStageName
  status: ReviewStatusName
  decision: ReviewAdviceName | null
  decidedAt: Date | null
}

/**
 * Junior as the periods read them
 * @typedef {Object} PeriodJunior
 */

export interface PeriodJunior {
  reviewOneDueAt: Date | null
  reviewFinalDueAt: Date | null
  deadlineAt: Date | null
  reviews: PeriodReview[]
}

/**
 * Promotion as the periods read it
 * @typedef {Object} PeriodInput
 */

export interface PeriodInput {
  startsAt: Date
  secondPeriodAt: Date | null
  juniors: PeriodJunior[]
}

/**
 * One period of a promotion, with its three moments
 * @typedef {Object} PromotionPeriod
 * @property {DatedPeriodName} key - Which period
 * @property {Date} startsAt - First day
 * @property {Date | null} reviewsFrom - Day the first check-in falls due
 * @property {Date | null} endsAt - Day the last decision was taken, open until then
 * @property {Date | null} expectedEndsAt - Day it should end by, known for the third one
 */

export interface PromotionPeriod {
  key: DatedPeriodName
  startsAt: Date
  reviewsFrom: Date | null
  endsAt: Date | null
  expectedEndsAt: Date | null
}

// Earliest of some moments
const earliest = (moments: (Date | null)[]): Date | null => {
  const known = moments.filter((moment): moment is Date => moment !== null)

  return known.length === 0 ? null : new Date(Math.min(...known.map((moment) => moment.getTime())))
}

// Latest of some moments
const latest = (moments: (Date | null)[]): Date | null => {
  const known = moments.filter((moment): moment is Date => moment !== null)

  return known.length === 0 ? null : new Date(Math.max(...known.map((moment) => moment.getTime())))
}

/**
 * Decided check-ins of one stage
 * @param {PeriodJunior} junior - Junior read
 * @param {AcademyStageName} stage - Stage looked for
 * @return {PeriodReview[]} - Validated check-ins
 */

const decided = (junior: PeriodJunior, stage: AcademyStageName): PeriodReview[] =>
  junior.reviews.filter(
    (review) => review.stage === stage && review.status === ReviewStatuses.Validated
  )

/**
 * Day a period closes: every junior that reached its check-in has been decided
 * @param {PeriodJunior[]} reached - Juniors that entered the check-in
 * @param {AcademyStageName} stage - Check-in stage
 * @return {Date | null} - Last decision, null while one waits
 */

const closing = (reached: PeriodJunior[], stage: AcademyStageName): Date | null => {
  if (reached.length === 0) return null
  if (reached.some((junior) => decided(junior, stage).length === 0)) return null

  return latest(reached.flatMap((junior) => decided(junior, stage).map((r) => r.decidedAt)))
}

/**
 * Rows the periods are read from
 * @typedef {Object} PeriodRows
 */

export interface PeriodRows {
  startsAt: Date
  secondPeriodAt: Date | null
  juniors: {
    reviewOneDueAt: Date | null
    reviewFinalDueAt: Date | null
    deadlineAt: Date | null
    reviews: {
      stage: string
      status: string
      decision: string | null
      decidedAt: Date | null
    }[]
  }[]
}

/**
 * Read a promotion row the way the periods reason about it
 * @param {PeriodRows} rows - Promotion with its juniors and their check-ins
 * @return {PeriodInput} - Periods input
 */

export const toPeriodInput = ({ startsAt, secondPeriodAt, juniors }: PeriodRows): PeriodInput => ({
  startsAt,
  secondPeriodAt,
  juniors: juniors.map((junior) => ({
    ...junior,
    reviews: junior.reviews.map((review) => ({
      stage: review.stage as AcademyStageName,
      status: review.status as ReviewStatusName,
      decision: review.decision as ReviewAdviceName | null,
      decidedAt: review.decidedAt,
    })),
  })),
})

/**
 * Resolve the dated periods of a promotion
 * @param {PeriodInput} input - Promotion and its juniors
 * @return {PromotionPeriod[]} - Periods that exist, in order
 */

export const promotionPeriods = ({
  startsAt,
  secondPeriodAt,
  juniors,
}: PeriodInput): PromotionPeriod[] => {
  const periods: PromotionPeriod[] = []

  // Period one runs until the second opens for everyone
  periods.push({
    key: 'periodOne',
    startsAt,
    reviewsFrom: earliest(juniors.map((junior) => junior.reviewOneDueAt)),
    endsAt: secondPeriodAt,
    expectedEndsAt: null,
  })

  if (secondPeriodAt) {
    const reached = juniors.filter((junior) => junior.reviewFinalDueAt !== null)
    periods.push({
      key: 'periodTwo',
      startsAt: secondPeriodAt,
      reviewsFrom: earliest(reached.map((junior) => junior.reviewFinalDueAt)),
      endsAt: closing(reached, AcademyStages.ReviewFinal),
      expectedEndsAt: null,
    })
  }

  // A third period exists once a deadline was granted
  const granted = juniors.filter((junior) => junior.deadlineAt !== null)
  if (granted.length > 0) {
    const grants = juniors.flatMap((junior) =>
      decided(junior, AcademyStages.ReviewFinal).filter(
        (review) => review.decision === ReviewAdvices.Bonus
      )
    )
    periods.push({
      key: 'periodThree',
      startsAt: earliest(grants.map((review) => review.decidedAt)) ?? startsAt,
      reviewsFrom: earliest(granted.map((junior) => junior.deadlineAt)),
      endsAt: closing(granted, AcademyStages.Bonus),
      expectedEndsAt: latest(granted.map((junior) => junior.deadlineAt)),
    })
  }

  return periods
}

/**
 * Where a period stands against a moment
 * @param {PromotionPeriod} period - Period read
 * @param {Date} [now] - Moment to compare with
 * @return {MilestoneState} - Done, in course or ahead
 */

export const periodState = (period: PromotionPeriod, now: Date = new Date()): MilestoneState => {
  if (period.endsAt && period.endsAt <= now) return 'done'

  return period.startsAt <= now ? 'current' : 'upcoming'
}

/**
 * Moments a period draws as zones on the calendar
 * @typedef {Object} PeriodZone
 * @property {'period' | 'trainings' | 'reviews'} part - Which zone
 * @property {DatedPeriodName} key - Which period
 * @property {Date} from - First day
 * @property {Date | null} to - Last day, open when still going
 */

export interface PeriodZone {
  part: 'period' | 'trainings' | 'reviews'
  key: DatedPeriodName
  from: Date
  to: Date | null
}

/**
 * Cut a period into the zones the calendar draws
 * @param {PromotionPeriod} period - Period read
 * @param {boolean} hasTrainings - The period has a trainings zone
 * @return {PeriodZone[]} - Zones, the period first
 */

export const periodZones = (period: PromotionPeriod, hasTrainings: boolean): PeriodZone[] => {
  const to = period.endsAt ?? period.expectedEndsAt
  const zones: PeriodZone[] = [{ part: 'period', key: period.key, from: period.startsAt, to }]

  if (hasTrainings) {
    zones.push({
      part: 'trainings',
      key: period.key,
      from: period.startsAt,
      to: period.reviewsFrom ?? to,
    })
  }
  if (period.reviewsFrom) {
    zones.push({ part: 'reviews', key: period.key, from: period.reviewsFrom, to })
  }

  return zones
}
