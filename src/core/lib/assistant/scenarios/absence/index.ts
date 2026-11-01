import {
  askPeriod,
  periodAnswer,
  reasonAnswer,
  reasonText,
  retryAnswer,
  saveCreate,
  startCreate,
} from '@/core/lib/assistant/scenarios/absence/create'
import {
  deleteAnswer,
  deleteChosen,
  deleteConfirm,
  deletePick,
  deleteRun,
} from '@/core/lib/assistant/scenarios/absence/delete'
import {
  editChosen,
  editPick,
  editReasonText,
  editWhat,
  editWhatAnswer,
  saveEdit,
} from '@/core/lib/assistant/scenarios/absence/edit'
import { listAbsences, menuAnswer, noneOffer } from '@/core/lib/assistant/scenarios/absence/list'
import { ABSENCE_SCENARIO_COPY as COPY } from '@/declarations/assistant/scenarios/absence'
import type { Scenario, ScenarioStep } from '@/types/scenario'
import { yesNo } from '@/core/lib/assistant/scenarios/absence/shared'

/**
 * The offer from a button: Memora asks before she starts
 * @return {Promise<ScenarioMove>} - Oui or non
 */

const offer: ScenarioStep = async () => ({
  say: [COPY.offer],
  ask: { kind: 'choices', choices: yesNo() },
  next: 'offerAnswer',
})

/**
 * Oui starts the talk, non lets go
 * @param {ScenarioContext} context - Member and data
 * @param {ScenarioAnswer | null} answer - Oui or non
 * @return {Promise<ScenarioMove>} - Next move
 */

const offerAnswer: ScenarioStep = async (context, answer) =>
  answer?.value === 'yes' ? { say: [COPY.offerYes], next: 'startCreate' } : { say: [COPY.offerNo] }

/**
 * Everything Memora does about absences
 * @type {Scenario}
 */

export const ABSENCE_SCENARIO: Scenario = {
  entries: {
    offer: 'offer',
    create: 'startCreate',
    edit: 'editPick',
    delete: 'deletePick',
    list: 'listAbsences',
  },
  steps: {
    offer,
    offerAnswer,
    startCreate,
    askPeriod,
    periodAnswer,
    retryAnswer,
    reasonAnswer,
    reasonText,
    saveCreate,
    editPick,
    editChosen,
    editWhat,
    editWhatAnswer,
    editReasonText,
    saveEdit,
    deletePick,
    deleteChosen,
    deleteConfirm,
    deleteAnswer,
    deleteRun,
    listAbsences,
    menuAnswer,
    noneOffer,
  },
}
