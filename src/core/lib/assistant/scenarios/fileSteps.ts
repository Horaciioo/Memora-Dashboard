import { SCENARIO_COPY } from '@/declarations/assistant/scenarios/shared'
import type { ScenarioStep } from '@/types/scenario'
import { fillTemplate } from '@/utils/format/strings'

/**
 * Oui or non offer on an open file
 * @param {string} question - Question template
 * @return {ScenarioStep} - Step
 */

export const fileOfferStep =
  (question: string): ScenarioStep =>
  async (context) => ({
    say: [fillTemplate(question, { name: context.data.name })],
    ask: {
      kind: 'choices',
      choices: [
        { value: 'yes', label: SCENARIO_COPY.yes },
        { value: 'no', label: SCENARIO_COPY.no },
      ],
    },
    next: 'fileAnswer',
  })

/**
 * Ticked properties become a queue
 * @param {string} line - Spoken line
 * @return {ScenarioStep} - Step
 */

export const filePropsStep =
  (line: string): ScenarioStep =>
  async (_context, answer) => ({
    say: [line],
    next: 'nextProp',
    data: { mode: 'queue', queue: answer?.value ?? '' },
  })
