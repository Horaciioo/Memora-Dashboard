import { apiDelete } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { failure } from '@/core/lib/assistant/scenarios/failure'
import {
  choiceOfAbsence,
  currentOf,
  ownAbsences,
  rangeOfAbsence,
} from '@/core/lib/assistant/scenarios/absence/shared'
import { ABSENCE_SCENARIO_COPY as COPY } from '@/declarations/assistant/scenarios/absence'
import { SCENARIO_COPY } from '@/declarations/assistant/scenarios/shared'
import type { ScenarioStep } from '@/types/scenario'
import { fillTemplate } from '@/utils/format/strings'

/**
 * Find which absence to remove
 * @param {ScenarioContext} context - Member and data
 * @return {Promise<ScenarioMove>} - Move picking it, or saying there is none
 */

export const deletePick: ScenarioStep = async (context) => {
  const current = currentOf(await ownAbsences(context.accountId), context.today)

  if (current.length === 0) return { say: [COPY.deleteNone] }
  if (current.length === 1)
    return { say: [], next: 'deleteConfirm', data: { deleteId: current[0].id } }

  return {
    say: [COPY.deleteWhich],
    ask: { kind: 'choices', choices: current.map(choiceOfAbsence) },
    next: 'deleteChosen',
  }
}

/**
 * The absence is picked
 * @param {ScenarioContext} context - Member and data
 * @param {ScenarioAnswer | null} answer - Absence identifier
 * @return {Promise<ScenarioMove>} - Move asking to confirm
 */

export const deleteChosen: ScenarioStep = async (context, answer) => ({
  say: [],
  next: 'deleteConfirm',
  data: { deleteId: answer?.value ?? '' },
})

/**
 * A removal is never silent
 * @param {ScenarioContext} context - Member and data
 * @return {Promise<ScenarioMove>} - Move asking to confirm
 */

export const deleteConfirm: ScenarioStep = async (context) => {
  const target = (await ownAbsences(context.accountId)).find(
    (absence) => absence.id === context.data.deleteId
  )
  if (!target) return { say: [SCENARIO_COPY.notUnderstood] }

  return {
    say: [fillTemplate(COPY.deleteSure, { range: rangeOfAbsence(target) })],
    ask: {
      kind: 'choices',
      choices: [
        { value: 'yes', label: COPY.deleteYes },
        { value: 'no', label: COPY.deleteKeep },
      ],
    },
    next: 'deleteAnswer',
  }
}

/**
 * Oui removes, non keeps
 * @param {ScenarioContext} context - Member and data
 * @param {ScenarioAnswer | null} answer - Oui or non
 * @return {Promise<ScenarioMove>} - Next move
 */

export const deleteAnswer: ScenarioStep = async (context, answer) =>
  answer?.value === 'yes'
    ? { say: [], next: 'deleteRun', thinking: true }
    : { say: [COPY.deleteKept] }

/**
 * Remove the absence
 * @param {ScenarioContext} context - Member and data
 * @return {Promise<ScenarioMove>} - Done, or why not
 */

export const deleteRun: ScenarioStep = async (context) => {
  const target = (await ownAbsences(context.accountId)).find(
    (absence) => absence.id === context.data.deleteId
  )
  if (!target) return { say: [SCENARIO_COPY.notUnderstood] }

  try {
    await apiDelete<{ id: string }>(API_ROUTES.absence(target.id))
  } catch (error) {
    return failure(error)
  }

  context.refresh()

  return { say: [fillTemplate(COPY.deleteDone, { range: rangeOfAbsence(target) })] }
}
