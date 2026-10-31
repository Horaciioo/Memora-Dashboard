import { foldText } from '@/utils/format/strings'
import type { CandidateView } from '@/types/recruitment'

const FRENCH = 'fr'

// Missing dates sink in both directions
const byDate =
  (direction: 1 | -1) =>
  (a: CandidateView, b: CandidateView): number => {
    if (a.interviewAt === b.interviewAt) return 0
    if (!a.interviewAt) return 1
    if (!b.interviewAt) return -1

    return direction * a.interviewAt.localeCompare(b.interviewAt)
  }

/**
 * Candidate comparators
 * @type {Record<string, (a: CandidateView, b: CandidateView) => number>}
 */

export const CANDIDATE_SORTS = {
  alphabetical: (a, b) => a.name.localeCompare(b.name, FRENCH),
  dateAscending: byDate(1),
  dateDescending: byDate(-1),
  discordId: (a, b) => a.discordId.localeCompare(b.discordId, FRENCH, { numeric: true }),
} satisfies Record<string, (a: CandidateView, b: CandidateView) => number>

export type CandidateSort = keyof typeof CANDIDATE_SORTS

// Sort applied without a choice
export const DEFAULT_CANDIDATE_SORT: CandidateSort = 'alphabetical'

export const isCandidateSort = (value: string): value is CandidateSort => value in CANDIDATE_SORTS

/**
 * Candidates matching the criteria
 * @param {CandidateView[]} candidates - Whole list
 * @param {Object} criteria - Active filters
 * @param {string} criteria.search - Free text
 * @param {string} criteria.recruiterId - Recruiter, empty for all
 * @param {string} criteria.outcomeId - Outcome, empty for all
 * @return {CandidateView[]} - Kept candidates
 */

export const filterCandidates = (
  candidates: CandidateView[],
  criteria: { search: string; recruiterId: string; outcomeId: string }
): CandidateView[] => {
  const term = foldText(criteria.search.trim())

  return candidates.filter((candidate) => {
    if (criteria.recruiterId && !candidate.recruiters.some((r) => r.id === criteria.recruiterId)) {
      return false
    }
    if (criteria.outcomeId && candidate.outcomeId !== criteria.outcomeId) return false
    if (!term) return true

    // Every name a person goes by
    const haystack = [
      candidate.name,
      candidate.displayName,
      candidate.memberName,
      candidate.discordId,
      candidate.formId,
      ...candidate.recruiters.map((recruiter) => recruiter.label),
    ]

    return haystack.some((value) => value && foldText(value).includes(term))
  })
}

/**
 * Candidates in the chosen order
 * @param {CandidateView[]} candidates - List to order
 * @param {CandidateSort} sort - Sort key
 * @return {CandidateView[]} - Ordered copy
 */

export const sortCandidates = (candidates: CandidateView[], sort: CandidateSort): CandidateView[] =>
  [...candidates].sort(CANDIDATE_SORTS[sort])
