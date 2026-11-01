import { apiGet, apiPatch } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { CANDIDATE_SCENARIO_COPY as COPY } from '@/declarations/assistant/scenarios/candidate'
import type { CandidateView } from '@/types/recruitment'
import type { FieldDefinition, FieldOption } from '@/types/forms'
import { fillTemplate } from '@/utils/format/strings'

// Properties asked as a list of members
export type SeatKind = 'recruiters' | 'observers'

// Form field of each list
export const SEAT_FIELDS: Record<SeatKind, string> = {
  recruiters: 'recruiterIds',
  observers: 'observerIds',
}

/**
 * Candidate as the file shows it
 * @param {string} id - Candidate identifier
 * @return {Promise<CandidateView>} - Fresh candidate
 */

export const readCandidate = (id: string): Promise<CandidateView> =>
  apiGet<CandidateView>(API_ROUTES.candidate(id))

/**
 * Options of one field of the candidate form
 * @param {string} id - Candidate identifier
 * @param {string} name - Field name
 * @return {Promise<FieldOption[]>} - Options
 */

export const optionsOf = async (id: string, name: string): Promise<FieldOption[]> =>
  (await apiGet<FieldDefinition[]>(API_ROUTES.candidateFields(id))).find(
    (field) => field.name === name
  )?.options ?? []

/**
 * Write one change, the form replaces everything so the rest is sent back as it is
 * @param {CandidateView} candidate - Candidate before
 * @param {Record<string, unknown>} change - Values replaced
 * @return {Promise<CandidateView>} - Candidate after
 */

export const saveChange = (
  candidate: CandidateView,
  change: Record<string, unknown>
): Promise<CandidateView> =>
  apiPatch<CandidateView>(API_ROUTES.candidate(candidate.id), {
    discordId: candidate.discordId,
    displayName: candidate.displayName,
    formId: candidate.formId,
    recruiterIds: candidate.recruiters.map((seat) => seat.id),
    observerIds: candidate.observers.map((seat) => seat.id),
    interviewAt: candidate.interviewAt,
    outcomeId: candidate.outcomeId,
    attended: candidate.attended,
    ...change,
  })

/**
 * A date and hour in words
 * @param {string} instant - ISO moment
 * @return {string} - Spoken moment
 */

export const momentOf = (instant: string): string =>
  new Date(instant).toLocaleString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })

/**
 * Names of a list, or nobody
 * @param {CandidateView['recruiters']} seats - Members
 * @return {string} - Names
 */

export const namesOf = (seats: CandidateView['recruiters']): string =>
  seats.length > 0 ? seats.map((seat) => seat.label).join(', ') : COPY.nobody

/**
 * Line asking a text property
 * @param {string} field - Property in words
 * @return {string} - Question
 */

export const textLine = (field: string): string =>
  fillTemplate(COPY.textAsk, { field: field.toLowerCase() })
