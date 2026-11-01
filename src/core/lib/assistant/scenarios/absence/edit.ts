import { apiPatch } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { failure } from '@/core/lib/assistant/scenarios/failure'
import {
  absenceLine,
  choiceOfAbsence,
  currentOf,
  dayOf,
  ownAbsences,
  rangeOfAbsence,
  yesNo,
} from '@/core/lib/assistant/scenarios/absence/shared'
import { ABSENCE_SCENARIO_COPY as COPY } from '@/declarations/assistant/scenarios/absence'
import { SCENARIO_COPY } from '@/declarations/assistant/scenarios/shared'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import type { ScenarioStep } from '@/types/scenario'
import type { MemberAbsence } from '@/types/members'
import { AbsenceStatuses } from '@/utils/constants/workflow'
import { fillTemplate } from '@/utils/format/strings'

// Words that empty the reason
const NO_REASON = ['aucune', 'aucun', 'rien', 'non', 'supprime', 'enleve']

// The absence being edited
const findEdited = async (accountId: string, id: string): Promise<MemberAbsence | null> =>
  (await ownAbsences(accountId)).find((absence) => absence.id === id) ?? null

/**
 * Find which absence to edit
 * @param {ScenarioContext} context - Member and data
 * @return {Promise<ScenarioMove>} - Move picking it, or saying there is none
 */

export const editPick: ScenarioStep = async (context) => {
  const current = currentOf(await ownAbsences(context.accountId), context.today)
  const base = { mode: 'edit', editId: '' }

  if (current.length === 0) {
    return {
      say: [COPY.editNone, COPY.editNoneOffer],
      ask: { kind: 'choices', choices: yesNo() },
      next: 'noneOffer',
      data: base,
    }
  }

  if (current.length === 1) {
    return {
      say: [fillTemplate(COPY.editOnly, { range: rangeOfAbsence(current[0]) })],
      next: 'editWhat',
      data: { ...base, editId: current[0].id },
    }
  }

  return {
    say: [COPY.editWhich],
    ask: { kind: 'choices', choices: current.map(choiceOfAbsence) },
    next: 'editChosen',
    data: base,
  }
}

/**
 * The absence is picked
 * @param {ScenarioContext} context - Member and data
 * @param {ScenarioAnswer | null} answer - Absence identifier
 * @return {Promise<ScenarioMove>} - Move asking what to change
 */

export const editChosen: ScenarioStep = async (context, answer) => ({
  say: [],
  next: 'editWhat',
  data: { editId: answer?.value ?? '' },
})

/**
 * Ask what to change
 * @return {Promise<ScenarioMove>} - Move with the three ways
 */

export const editWhat: ScenarioStep = async () => ({
  say: [COPY.editWhat],
  ask: {
    kind: 'choices',
    choices: [
      { value: 'dates', label: COPY.editDates },
      { value: 'reason', label: COPY.editReason },
      { value: 'nothing', label: COPY.editNothing },
    ],
  },
  next: 'editWhatAnswer',
})

/**
 * Dates or reason
 * @param {ScenarioContext} context - Member and data
 * @param {ScenarioAnswer | null} answer - What to change
 * @return {Promise<ScenarioMove>} - Next move
 */

export const editWhatAnswer: ScenarioStep = async (context, answer) => {
  if (answer?.value === 'dates') return { say: [], next: 'askPeriod', data: { part: 'dates' } }
  if (answer?.value === 'reason') {
    return {
      say: [COPY.editReasonNew],
      ask: { kind: 'text' },
      next: 'editReasonText',
      data: { part: 'reason' },
    }
  }

  return { say: [COPY.menuBye] }
}

/**
 * The new reason is typed
 * @param {ScenarioContext} context - Member and data
 * @param {ScenarioAnswer | null} answer - Text
 * @return {Promise<ScenarioMove>} - Next move
 */

export const editReasonText: ScenarioStep = async (context, answer) => {
  const typed = (answer?.value ?? '').trim()
  const max = FORM_SETTINGS.shortTextMaxLength

  if (typed.length > max) {
    return {
      say: [fillTemplate(COPY.reasonTooLong, { max: String(max) })],
      ask: { kind: 'text' },
      next: 'editReasonText',
    }
  }

  const isEmpty = NO_REASON.includes(typed.toLowerCase())

  return { say: [], next: 'saveEdit', thinking: true, data: { reason: isEmpty ? '' : typed } }
}

/**
 * Write the change
 * @param {ScenarioContext} context - Member and data
 * @return {Promise<ScenarioMove>} - Done, or why not
 */

export const saveEdit: ScenarioStep = async (context) => {
  const edited = await findEdited(context.accountId, context.data.editId)
  if (!edited) return { say: [SCENARIO_COPY.notUnderstood] }

  // The form asks for the days even when only the reason moves
  const isDates = context.data.part === 'dates'
  const start = isDates ? context.data.start : dayOf(edited.startDate)
  const end = isDates ? context.data.end : dayOf(edited.endDate)

  try {
    await apiPatch<MemberAbsence>(API_ROUTES.absence(edited.id), {
      dates: [start, end],
      ...(isDates ? {} : { reason: context.data.reason }),
    })
  } catch (error) {
    return failure(error)
  }

  context.refresh()

  // New dates on a taken-into-account absence go back for review
  const reopens = isDates && edited.status === AbsenceStatuses.Approved

  return { say: [absenceLine(COPY.editDone, start, end), ...(reopens ? [COPY.editReopened] : [])] }
}
