import {
  AcademyJuniorStatuses,
  AcademySessionStatuses,
  AcademyStages,
  DepartureKinds,
  ReviewAdvices,
  ReviewStatuses,
} from '@/utils/constants/hierarchy'
import type {
  AcademyJuniorStatusName,
  AcademySessionStatusName,
  AcademyStageName,
  DepartureKindName,
  ReviewAdviceName,
  ReviewStatusName,
} from '@/utils/constants/hierarchy'

/**
 * Where a junior stands on the AcademicParkour
 * @typedef {string} ParkourPhase
 */

export type ParkourPhase =
  | 'needsTrainer'
  | 'needsKickoff'
  | 'awaitingInfo'
  | 'ready'
  | 'periodOne'
  | 'reviewOneDue'
  | 'reviewOneSubmitted'
  | 'periodOneDone'
  | 'periodTwo'
  | 'reviewTwoDue'
  | 'reviewTwoSubmitted'
  | 'periodThree'
  | 'finalReviewDue'
  | 'finalReviewSubmitted'
  | 'graduated'
  | 'dismissed'
  | 'resigned'

/**
 * Review as the parkour reads it
 * @typedef {Object} ParkourReview
 * @property {AcademyStageName} stage - Stage held for
 * @property {ReviewStatusName} status - Lifecycle
 */

export interface ParkourReview {
  stage: AcademyStageName
  status: ReviewStatusName
}

/**
 * Junior as the parkour reads it
 * @typedef {Object} ParkourJunior
 */

export interface ParkourJunior {
  status: AcademyJuniorStatusName
  stage: AcademyStageName
  trainerId: string | null
  kickoffAt: Date | null
  confirmedAt: Date | null
  liveCount: number
  deadlineAt: Date | null
  reviews: ParkourReview[]
}

/**
 * Promotion as the parkour reads it
 * @typedef {Object} ParkourSession
 * @property {AcademySessionStatusName} status - Lifecycle
 * @property {Date | null} secondPeriodAt - Second period opened
 */

export interface ParkourSession {
  status: AcademySessionStatusName
  secondPeriodAt: Date | null
}

/**
 * Lives thresholds of the two first periods
 * @typedef {Object} ParkourThresholds
 * @property {number} firstPeriodLives - Lives before the first check-in
 * @property {number} secondPeriodLives - Lives added before the second
 */

export interface ParkourThresholds {
  firstPeriodLives: number
  secondPeriodLives: number
}

// Check-in stage closing each period
const REVIEW_OF: Partial<Record<AcademyStageName, AcademyStageName>> = {
  [AcademyStages.Discovery]: AcademyStages.ReviewOne,
  [AcademyStages.ReviewOne]: AcademyStages.ReviewOne,
  [AcademyStages.Practice]: AcademyStages.ReviewFinal,
  [AcademyStages.ReviewFinal]: AcademyStages.ReviewFinal,
  [AcademyStages.Bonus]: AcademyStages.Bonus,
}

/**
 * Whether a check-in of a stage reached a given status
 * @param {ParkourReview[]} reviews - Check-ins
 * @param {AcademyStageName} stage - Stage
 * @param {ReviewStatusName} status - Status looked for
 * @return {boolean} - Found
 */

const hasReview = (
  reviews: ParkourReview[],
  stage: AcademyStageName,
  status: ReviewStatusName
): boolean => reviews.some((review) => review.stage === stage && review.status === status)

/**
 * Lives a junior needs before the check-in of their stage
 * @param {AcademyStageName} stage - Stage
 * @param {ParkourThresholds} thresholds - Lives thresholds
 * @return {number | null} - Lives needed
 */

export const livesBeforeReview = (
  stage: AcademyStageName,
  thresholds: ParkourThresholds
): number | null => {
  if (stage === AcademyStages.Discovery || stage === AcademyStages.ReviewOne) {
    return thresholds.firstPeriodLives
  }
  if (stage === AcademyStages.Practice || stage === AcademyStages.ReviewFinal) {
    return thresholds.firstPeriodLives + thresholds.secondPeriodLives
  }

  return null
}

/**
 * Stage the lives counted push a junior to
 * @param {AcademyStageName} stage - Current stage
 * @param {number} liveCount - Lives counted
 * @param {ParkourThresholds} thresholds - Lives thresholds
 * @return {AcademyStageName} - Stage after the count
 */

export const stageForLives = (
  stage: AcademyStageName,
  liveCount: number,
  thresholds: ParkourThresholds
): AcademyStageName => {
  const needed = livesBeforeReview(stage, thresholds)
  if (needed === null || liveCount < needed) return stage

  if (stage === AcademyStages.Discovery) return AcademyStages.ReviewOne
  if (stage === AcademyStages.Practice) return AcademyStages.ReviewFinal

  return stage
}

/**
 * Resolve where a junior stands
 * @param {ParkourJunior} junior - Junior
 * @param {ParkourSession} session - Promotion
 * @param {Date} [now] - Moment to resolve against
 * @return {ParkourPhase} - Phase
 */

export const resolvePhase = (
  junior: ParkourJunior,
  session: ParkourSession,
  now: Date = new Date()
): ParkourPhase => {
  // Ends first
  if (junior.status === AcademyJuniorStatuses.Validated) return 'graduated'
  if (junior.status === AcademyJuniorStatuses.Stopped) return 'dismissed'
  if (junior.status === AcademyJuniorStatuses.Resigned) return 'resigned'

  // Before the PIM runs for this junior
  if (junior.stage === AcademyStages.Preparation) {
    if (!junior.trainerId) return 'needsTrainer'
    if (!junior.kickoffAt) return 'needsKickoff'
    if (!junior.confirmedAt) return 'awaitingInfo'
    return 'ready'
  }

  const { reviews } = junior

  if (junior.stage === AcademyStages.Discovery) return 'periodOne'

  if (junior.stage === AcademyStages.ReviewOne) {
    if (hasReview(reviews, AcademyStages.ReviewOne, ReviewStatuses.Validated)) {
      return session.secondPeriodAt ? 'periodTwo' : 'periodOneDone'
    }
    if (hasReview(reviews, AcademyStages.ReviewOne, ReviewStatuses.Submitted)) {
      return 'reviewOneSubmitted'
    }
    return 'reviewOneDue'
  }

  if (junior.stage === AcademyStages.Practice) return 'periodTwo'

  if (junior.stage === AcademyStages.ReviewFinal) {
    if (hasReview(reviews, AcademyStages.ReviewFinal, ReviewStatuses.Submitted)) {
      return 'reviewTwoSubmitted'
    }
    return 'reviewTwoDue'
  }

  // Third period
  if (hasReview(reviews, AcademyStages.Bonus, ReviewStatuses.Submitted)) {
    return 'finalReviewSubmitted'
  }
  if (junior.deadlineAt && junior.deadlineAt <= now) return 'finalReviewDue'

  return 'periodThree'
}

/**
 * Phases where a trainer owes a check-in
 * @type {ParkourPhase[]}
 */

export const REVIEW_DUE_PHASES: ParkourPhase[] = ['reviewOneDue', 'reviewTwoDue', 'finalReviewDue']

/**
 * Phases where a responsable owes a decision
 * @type {ParkourPhase[]}
 */

export const DECISION_PHASES: ParkourPhase[] = [
  'reviewOneSubmitted',
  'reviewTwoSubmitted',
  'finalReviewSubmitted',
]

/**
 * Phases freezing a junior's own timeline
 * @type {ParkourPhase[]}
 */

export const PAUSED_PHASES: ParkourPhase[] = [...DECISION_PHASES, 'periodOneDone']

/**
 * Stage of the check-in a phase waits on
 * @param {AcademyStageName} stage - Junior stage
 * @return {AcademyStageName | null} - Check-in stage
 */

export const reviewStageOf = (stage: AcademyStageName): AcademyStageName | null =>
  REVIEW_OF[stage] ?? null

/**
 * Advices a trainer may give at a check-in
 * @param {AcademyStageName} stage - Check-in stage
 * @return {ReviewAdviceName[]} - Advices
 */

export const advicesFor = (stage: AcademyStageName): ReviewAdviceName[] => {
  if (stage === AcademyStages.ReviewFinal) {
    return [ReviewAdvices.Pass, ReviewAdvices.Stop, ReviewAdvices.Bonus]
  }
  if (stage === AcademyStages.Bonus) return [ReviewAdvices.Pass, ReviewAdvices.Stop]

  return []
}

/**
 * Outcomes a responsable may keep at a check-in
 * @param {AcademyStageName} stage - Check-in stage
 * @return {ReviewAdviceName[]} - Outcomes
 */

export const decisionsFor = (stage: AcademyStageName): ReviewAdviceName[] => {
  if (stage === AcademyStages.ReviewFinal) {
    return [ReviewAdvices.Pass, ReviewAdvices.Stop, ReviewAdvices.Bonus]
  }

  return [ReviewAdvices.Pass, ReviewAdvices.Stop]
}

/**
 * What a responsable's decision does to the junior
 * @typedef {'secondPeriod' | 'thirdPeriod' | 'graduate' | 'dismiss'} DecisionEffect
 */

export type DecisionEffect = 'secondPeriod' | 'thirdPeriod' | 'graduate' | 'dismiss'

/**
 * Effect of a responsable's decision
 * @param {AcademyStageName} stage - Check-in stage
 * @param {ReviewAdviceName} decision - Outcome kept
 * @return {DecisionEffect} - Effect
 */

export const decisionEffect = (
  stage: AcademyStageName,
  decision: ReviewAdviceName
): DecisionEffect => {
  if (decision === ReviewAdvices.Stop) return 'dismiss'
  if (stage === AcademyStages.ReviewOne) return 'secondPeriod'
  if (stage === AcademyStages.ReviewFinal && decision === ReviewAdvices.Bonus) return 'thirdPeriod'

  return 'graduate'
}

/**
 * Whether a promotion may start on its own: every live seat confirmed
 * @param {ParkourSession} session - Promotion
 * @param {ParkourJunior[]} juniors - Its juniors
 * @return {boolean} - Ready to launch
 */

export const readyToLaunch = (session: ParkourSession, juniors: ParkourJunior[]): boolean => {
  if (session.status === AcademySessionStatuses.Running) return false

  const seated = juniors.filter((junior) => junior.status === AcademyJuniorStatuses.Active)

  return seated.length > 0 && seated.every((junior) => junior.confirmedAt !== null)
}

/**
 * Whether the second period may open on its own: every live junior decided
 * @param {ParkourSession} session - Promotion
 * @param {ParkourJunior[]} juniors - Its juniors
 * @return {boolean} - Ready to open
 */

export const readyForSecondPeriod = (
  session: ParkourSession,
  juniors: ParkourJunior[]
): boolean => {
  if (session.secondPeriodAt || session.status !== AcademySessionStatuses.Running) return false

  const running = juniors.filter(
    (junior) =>
      junior.status === AcademyJuniorStatuses.Active && junior.stage !== AcademyStages.Preparation
  )

  return (
    running.length > 0 &&
    running.every((junior) => resolvePhase(junior, session) === 'periodOneDone')
  )
}

/**
 * Pieces of a departure announcement
 * @typedef {Object} DepartureInput
 * @property {string} username - Discord name
 * @property {string} discordId - Discord identifier
 * @property {string} functionName - Main function held
 * @property {string} emoji - Function emoji
 * @property {DepartureKindName} kind - Dismissal or resignation
 */

export interface DepartureInput {
  username: string
  discordId: string
  functionName: string
  emoji: string
  kind: DepartureKindName
}

/**
 * Fill a departure announcement template
 * @param {string} template - Template with its placeholders
 * @param {Record<DepartureKindName, string>} verbs - Verb per departure kind
 * @param {DepartureInput} input - Pieces
 * @return {string} - Announcement
 */

export const fillDeparture = (
  template: string,
  verbs: Record<DepartureKindName, string>,
  input: DepartureInput
): string =>
  template
    .replaceAll('{username}', input.username)
    .replaceAll('{identifiant}', input.discordId)
    .replaceAll('{verbe}', verbs[input.kind])
    .replaceAll('{fonction}', input.functionName)
    .replaceAll('{emoji}', input.emoji)
    .trim()

/**
 * Departure kind of an ending junior status
 * @param {AcademyJuniorStatusName} status - Junior status
 * @return {DepartureKindName | null} - Kind
 */

export const departureOf = (status: AcademyJuniorStatusName): DepartureKindName | null => {
  if (status === AcademyJuniorStatuses.Stopped) return DepartureKinds.Dismissal
  if (status === AcademyJuniorStatuses.Resigned) return DepartureKinds.Resignation

  return null
}
