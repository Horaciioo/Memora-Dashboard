import { isReviewMissing } from '@/core/lib/recruitment/review'
import type { CandidateView, RecruitmentOutcomeView } from '@/types/recruitment'

const MINUTE_MS = 60_000

/**
 * Figures of an interviewer
 * @typedef {Object} InterviewerStats
 * @property {number} conducted - Interviews with a verdict
 * @property {number} upcoming - Interviews still ahead
 * @property {number} attended - Candidates who came
 * @property {number} due - Slots already past
 * @property {Record<string, number>} verdicts - Count per outcome
 * @property {number | null} averageMinutes - Mean interview length
 * @property {number} pendingReviews - Judged without a bilan
 */

export interface InterviewerStats {
  conducted: number
  upcoming: number
  attended: number
  due: number
  verdicts: Record<string, number>
  averageMinutes: number | null
  pendingReviews: number
}

/**
 * Figures over a list of interviews
 * @param {CandidateView[]} candidates - Interviews led by the viewer
 * @param {number} now - Server milliseconds
 * @param {RecruitmentOutcomeView[]} outcomes - Outcomes of the session
 * @return {InterviewerStats} - Counts and mean
 */

export const interviewerStats = (
  candidates: CandidateView[],
  now: number,
  outcomes: RecruitmentOutcomeView[]
): InterviewerStats => {
  const judged = candidates.filter((candidate) => candidate.verdictAt !== null)
  const slotted = candidates.filter((candidate) => candidate.interviewAt !== null)
  const due = slotted.filter((candidate) => new Date(candidate.interviewAt!).getTime() <= now)

  // Length of each timed interview
  const lengths = judged
    .filter((candidate) => candidate.interviewStartedAt !== null)
    .map(
      (candidate) =>
        (new Date(candidate.verdictAt!).getTime() -
          new Date(candidate.interviewStartedAt!).getTime()) /
        MINUTE_MS
    )

  return {
    conducted: judged.length,
    upcoming: slotted.length - due.length,
    attended: due.filter((candidate) => candidate.attended).length,
    due: due.length,
    verdicts: Object.fromEntries(
      outcomes.map((outcome) => [
        outcome.id,
        judged.filter((candidate) => candidate.outcomeId === outcome.id).length,
      ])
    ),
    averageMinutes:
      lengths.length > 0 ? lengths.reduce((sum, value) => sum + value, 0) / lengths.length : null,
    pendingReviews: candidates.filter(isReviewMissing).length,
  }
}
