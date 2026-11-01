import { apiGet } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { ABSENCE_SCENARIO_COPY as COPY } from '@/declarations/assistant/scenarios/absence'
import { SCENARIO_COPY } from '@/declarations/assistant/scenarios/shared'
import { ROUTES } from '@/declarations/navigation'
import type { ScenarioChoice, ScenarioLine, ScenarioSpan } from '@/types/scenario'
import type { MemberAbsence } from '@/types/members'
import { AbsenceStatuses } from '@/utils/constants/workflow'
import type { AbsenceStatusName } from '@/utils/constants/workflow'
import { absenceRange } from '@/utils/format/absences'
import { capitalizeFirstLetter } from '@/utils/format/strings'

// Statuses of an absence that still counts
const COUNTING: AbsenceStatusName[] = [AbsenceStatuses.Pending, AbsenceStatuses.Approved]

// Words of each status
const STATUS_WORDS: Record<AbsenceStatusName, string> = {
  [AbsenceStatuses.Pending]: COPY.statusPending,
  [AbsenceStatuses.Approved]: COPY.statusApproved,
  [AbsenceStatuses.Refused]: COPY.statusRefused,
  [AbsenceStatuses.Cancelled]: COPY.statusCancelled,
}

/**
 * Day of a stored moment
 * @param {string} moment - ISO moment
 * @return {string} - ISO day
 */

export const dayOf = (moment: string): string => moment.slice(0, 10)

/**
 * Own absences, newest first
 * @param {string} accountId - Signed-in member
 * @return {Promise<MemberAbsence[]>} - Absences
 */

export const ownAbsences = async (accountId: string): Promise<MemberAbsence[]> =>
  (await apiGet<MemberAbsence[]>(API_ROUTES.absences)).filter(
    (absence) => absence.accountId === accountId
  )

/**
 * Absences running or still to come that count
 * @param {MemberAbsence[]} absences - Own absences
 * @param {string} today - ISO day
 * @return {MemberAbsence[]} - Current ones, soonest first
 */

export const currentOf = (absences: MemberAbsence[], today: string): MemberAbsence[] =>
  absences
    .filter((absence) => COUNTING.includes(absence.status) && dayOf(absence.endDate) >= today)
    .sort((left, right) => left.startDate.localeCompare(right.startDate))

/**
 * Absences that still take days, one left out
 * @param {MemberAbsence[]} absences - Own absences
 * @param {string} [exceptId] - Absence being edited
 * @return {MemberAbsence[]} - Absences taking days
 */

export const takingDays = (absences: MemberAbsence[], exceptId?: string): MemberAbsence[] =>
  absences.filter((absence) => COUNTING.includes(absence.status) && absence.id !== exceptId)

/**
 * Days already taken, as spans for the calendar
 * @param {MemberAbsence[]} absences - Own absences
 * @param {string} [exceptId] - Absence being edited
 * @return {ScenarioSpan[]} - Taken spans
 */

export const bookedOf = (absences: MemberAbsence[], exceptId?: string): ScenarioSpan[] =>
  takingDays(absences, exceptId).map((absence) => ({
    start: dayOf(absence.startDate),
    end: dayOf(absence.endDate),
  }))

/**
 * Range of an absence
 * @param {MemberAbsence} absence - Absence
 * @return {string} - Spoken range
 */

export const rangeOfAbsence = (absence: MemberAbsence): string =>
  absenceRange(dayOf(absence.startDate), dayOf(absence.endDate))

/**
 * Status of an absence in a word
 * @param {MemberAbsence} absence - Absence
 * @return {string} - Status word
 */

export const statusOf = (absence: MemberAbsence): string => STATUS_WORDS[absence.status]

/**
 * Oui and non
 * @return {ScenarioChoice[]} - Both answers
 */

export const yesNo = (): ScenarioChoice[] => [
  { value: 'yes', label: SCENARIO_COPY.yes },
  { value: 'no', label: SCENARIO_COPY.no },
]

/**
 * An absence as an answer to pick
 * @param {MemberAbsence} absence - Absence
 * @return {ScenarioChoice} - Choice
 */

export const choiceOfAbsence = (absence: MemberAbsence): ScenarioChoice => ({
  value: absence.id,
  label: capitalizeFirstLetter(rangeOfAbsence(absence)),
  hint: statusOf(absence),
})

/**
 * Line pointing at the absences page
 * @param {string} text - Line before the link
 * @param {string} start - First ISO day
 * @param {string} end - Last ISO day
 * @return {ScenarioLine} - Line with its link
 */

export const absenceLine = (text: string, start: string, end: string): ScenarioLine => ({
  text,
  link: { label: capitalizeFirstLetter(absenceRange(start, end)), href: ROUTES.absences },
})
