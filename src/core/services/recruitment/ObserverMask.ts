import { CANDIDATE_COPY } from '@/declarations/recruitment/candidateCopy'
import type { CandidateView } from '@/types/recruitment'

/**
 * Hide who a candidate is, and what the team wrote, from an observer
 * @param {CandidateView} candidate - Candidate card
 * @return {CandidateView} - Card without a way to reach the person nor remarks
 */

export const maskForObserver = (candidate: CandidateView): CandidateView => ({
  ...candidate,
  discordId: '',
  comments: [],
  name: candidate.memberName ?? candidate.displayName ?? CANDIDATE_COPY.anonymous,
})
