import { AcademyStages, ReviewStatuses } from '@/utils/constants/hierarchy'
import type { AcademyStageName, ReviewStatusName } from '@/utils/constants/hierarchy'
import { EventPurposes } from '@/utils/constants/workflow'
import type { EventPurposeName } from '@/utils/constants/workflow'

/**
 * Junior as the review templates read them
 * @typedef {Object} ReviewTemplateJunior
 * @property {AcademyStageName} stage - Stage the junior stands in
 * @property {{ stage: AcademyStageName, status: ReviewStatusName }[]} reviews - Check-ins written
 */

export interface ReviewTemplateJunior {
  stage: AcademyStageName
  reviews: { stage: AcademyStageName; status: ReviewStatusName }[]
}

// Check-ins a trainer deposited, a draft is still to do
const DEPOSITED: ReviewStatusName[] = [ReviewStatuses.Submitted, ReviewStatuses.Validated]

/**
 * Stage a final check-in is written for
 * @param {AcademyStageName} stage - Stage the junior stands in
 * @return {AcademyStageName} - The third period's, else the second's
 */

export const finalStageOf = (stage: AcademyStageName): AcademyStageName =>
  stage === AcademyStages.Bonus ? AcademyStages.Bonus : AcademyStages.ReviewFinal

/**
 * Whether a check-in of a stage was deposited
 * @param {ReviewTemplateJunior} junior - Junior read
 * @param {AcademyStageName} stage - Stage looked for
 * @return {boolean} - Deposited
 */

const isDeposited = (junior: ReviewTemplateJunior, stage: AcademyStageName): boolean =>
  junior.reviews.some((review) => review.stage === stage && DEPOSITED.includes(review.status))

/**
 * Whether a check-in template still makes sense for a junior
 * @param {EventPurposeName} purpose - Template purpose
 * @param {ReviewTemplateJunior} junior - Junior read
 * @return {boolean} - Template open, greyed otherwise
 */

export const isReviewOpen = (purpose: EventPurposeName, junior: ReviewTemplateJunior): boolean => {
  if (purpose === EventPurposes.ReviewOne) return !isDeposited(junior, AcademyStages.ReviewOne)
  if (purpose !== EventPurposes.ReviewFinal) return true

  // The second check-in waits for the first, and closes once deposited
  return (
    isDeposited(junior, AcademyStages.ReviewOne) && !isDeposited(junior, finalStageOf(junior.stage))
  )
}

// Days before the end of a period a check-in is declared
export const DECLARED_DAYS_BEFORE = 7

/**
 * Day a check-in opens to be declared: a week before the period of the junior ends
 * @param {EventPurposeName} purpose - Template purpose
 * @param {{ dueOne: Date | null, dueFinal: Date | null }} junior - End of each period of the junior
 * @return {Date | null} - First day, none when the end is not known yet
 */

export const reviewOpensAt = (
  purpose: EventPurposeName,
  junior: { dueOne: Date | null; dueFinal: Date | null }
): Date | null => {
  const due = purpose === EventPurposes.ReviewOne ? junior.dueOne : junior.dueFinal

  return due ? new Date(due.getTime() - DECLARED_DAYS_BEFORE * 86_400_000) : null
}

/**
 * Purposes drawn as check-ins
 * @type {EventPurposeName[]}
 */

export const REVIEW_PURPOSES: EventPurposeName[] = [
  EventPurposes.ReviewOne,
  EventPurposes.ReviewFinal,
]
