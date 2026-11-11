import {
  creatorAnswer,
  createStart,
  lengthAnswer,
  lengthAsk,
  platformAnswer,
  recap,
  recapAnswer,
  save,
  timeAnswer,
  whenAnswer,
} from '@/core/lib/assistant/scenarios/live/create'
import {
  deleteAnswer,
  deleteConfirm,
  deletePick,
  deleteRun,
} from '@/core/lib/assistant/scenarios/live/delete'
import { LIVE_SCENARIO_COPY as COPY } from '@/declarations/assistant/scenarios/live'
import type { Scenario, ScenarioStep } from '@/types/scenario'

/**
 * The offer from a button: plan, remove or leave
 * @return {Promise<ScenarioMove>} - Three ways
 */

const offer: ScenarioStep = async () => ({
  say: [COPY.offer],
  ask: {
    kind: 'choices',
    choices: [
      { value: 'create', label: COPY.create },
      { value: 'delete', label: COPY.remove },
      { value: 'no', label: COPY.leave },
    ],
  },
  next: 'offerAnswer',
})

const offerAnswer: ScenarioStep = async (context, answer) => {
  if (answer?.value === 'create') return { say: [], next: 'createStart' }
  if (answer?.value === 'delete') return { say: [], next: 'deletePick' }

  return { say: [COPY.offerNo] }
}

/**
 * Everything Memora does about lives
 * @type {Scenario}
 */

export const LIVE_SCENARIO: Scenario = {
  entries: { offer: 'offer', create: 'createStart', delete: 'deletePick' },
  steps: {
    offer,
    offerAnswer,
    createStart,
    platformAnswer,
    creatorAnswer,
    whenAnswer,
    timeAnswer,
    lengthAsk,
    lengthAnswer,
    recap,
    recapAnswer,
    save,
    deletePick,
    deleteConfirm,
    deleteAnswer,
    deleteRun,
  },
}
