import {
  askCreator,
  askJob,
  askPeriod,
  creatorAnswer,
  jobAnswer,
  periodAnswer,
} from '@/core/lib/assistant/scenarios/recruitment/ask'
import { launch, recapAnswer } from '@/core/lib/assistant/scenarios/recruitment/launch'
import { RECRUITMENT_SCENARIO_COPY as COPY } from '@/declarations/assistant/scenarios/recruitment'
import { SCENARIO_COPY } from '@/declarations/assistant/scenarios/shared'
import type { Scenario, ScenarioStep } from '@/types/scenario'

/**
 * The offer from a button: Memora asks before she starts
 * @return {Promise<ScenarioMove>} - Oui or non
 */

const offer: ScenarioStep = async () => ({
  say: [COPY.offer],
  ask: {
    kind: 'choices',
    choices: [
      { value: 'yes', label: SCENARIO_COPY.yes },
      { value: 'no', label: SCENARIO_COPY.no },
    ],
  },
  next: 'offerAnswer',
})

/**
 * Oui starts the talk, non lets go
 * @param {ScenarioContext} context - Member and data
 * @param {ScenarioAnswer | null} answer - Oui or non
 * @return {Promise<ScenarioMove>} - Next move
 */

const offerAnswer: ScenarioStep = async (context, answer) =>
  answer?.value === 'yes'
    ? { say: [COPY.offerYes], next: 'askCreator', data: { key: crypto.randomUUID() } }
    : { say: [COPY.offerNo] }

/**
 * Everything Memora does about recruitments
 * @type {Scenario}
 */

export const RECRUITMENT_SCENARIO: Scenario = {
  entries: { offer: 'offer' },
  steps: {
    offer,
    offerAnswer,
    askCreator,
    creatorAnswer,
    askJob,
    jobAnswer,
    askPeriod,
    periodAnswer,
    recapAnswer,
    launch,
  },
}
