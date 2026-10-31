import { RECRUITMENT_SETTINGS } from '@/declarations/configurations/recruitment'

/**
 * Whether the bilan of a judged candidate is still to write
 * @param {{ review: string, verdictAt: Date | string | null }} candidate - Written bilan and verdict
 * @return {boolean} - True once judged with a bilan below the threshold
 */

export const isReviewMissing = (candidate: {
  review: string
  verdictAt: Date | string | null
}): boolean =>
  candidate.verdictAt !== null &&
  candidate.review.replace(/\s/g, '').length < RECRUITMENT_SETTINGS.reviewMinCharacters
