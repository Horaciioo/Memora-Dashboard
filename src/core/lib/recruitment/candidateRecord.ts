import type { FormValues } from '@/types/forms'
import type { CandidateView } from '@/types/recruitment'

/**
 * Every editable field of a candidate, as the record file holds them
 * @param {CandidateView} candidate - Applicant followed
 * @return {FormValues} - Initial values of the record
 */

export const candidateRecordValues = (candidate: CandidateView): FormValues => ({
  discordId: candidate.discordId,
  displayName: candidate.displayName,
  formId: candidate.formId,
  recruiterIds: candidate.recruiters.map((seat) => seat.id),
  interviewAt: candidate.interviewAt,
  observerIds: candidate.observers.map((seat) => seat.id),
  outcomeId: candidate.outcomeId,
  attended: candidate.attended,
})
