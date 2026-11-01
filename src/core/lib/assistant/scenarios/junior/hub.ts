import { apiGet } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import {
  juniorLine,
  readDossier,
  readFollow,
  stepSentence,
} from '@/core/lib/assistant/scenarios/junior/data'
import { JUNIOR_SCENARIO_COPY as COPY } from '@/declarations/assistant/scenarios/junior'
import { ASSISTANT_SETTINGS } from '@/declarations/assistant/settings'
import type { ScenarioChoice, ScenarioMove, ScenarioStep } from '@/types/scenario'
import { StepOwners } from '@/utils/constants/hierarchy'
import { fillTemplate } from '@/utils/format/strings'

// One junior found by the search
interface Found {
  juniorId: string
  sessionId: string
  name: string
  hint: string | null
}

const searchAsk = (placeholder: string): ScenarioMove['ask'] => ({ kind: 'search', placeholder })

/**
 * Entry without a junior: one of them, the member's steps, or a trainer
 * @return {Promise<ScenarioMove>} - Choices
 */

export const home: ScenarioStep = async () => {
  const { canFollow } = await readFollow()
  const choices: ScenarioChoice[] = [
    { value: 'one', label: COPY.homeOne },
    { value: 'mine', label: COPY.homeMine },
    ...(canFollow ? [{ value: 'follow', label: COPY.homeFollow }] : []),
  ]

  return { say: [COPY.homeAsk], ask: { kind: 'choices', choices }, next: 'homeAnswer' }
}

export const homeAnswer: ScenarioStep = async (context, answer) => ({
  say: [],
  next: answer?.value === 'mine' ? 'mine' : answer?.value === 'follow' ? 'askTrainer' : 'askWho',
})

/**
 * Ask which junior is meant
 * @return {Promise<ScenarioMove>} - Search field
 */

export const askWho: ScenarioStep = async () => ({
  say: [COPY.who],
  ask: searchAsk(COPY.whoHint),
  next: 'whoAnswer',
})

const picked = (found: { juniorId: string; name: string }): ScenarioMove => ({
  say: [],
  next: 'hub',
  data: { juniorId: found.juniorId, name: found.name },
})

/**
 * Search the words, one hit goes straight on
 * @param {ScenarioContext} context - Member and data
 * @param {ScenarioAnswer | null} answer - Words typed
 * @return {Promise<ScenarioMove>} - Next move
 */

export const whoAnswer: ScenarioStep = async (context, answer) => {
  const text = answer?.value ?? ''
  const hits = await apiGet<Found[]>(`${API_ROUTES.juniorSearch}?q=${encodeURIComponent(text)}`)

  if (hits.length === 0) {
    return {
      say: [fillTemplate(COPY.whoNone, { text })],
      ask: searchAsk(COPY.whoHint),
      next: 'whoAnswer',
    }
  }
  if (hits.length === 1) return picked(hits[0])

  const choices: ScenarioChoice[] = [
    ...hits.slice(0, ASSISTANT_SETTINGS.maxChoices).map((hit) => ({
      value: hit.juniorId,
      label: hit.name,
      hint: hit.hint ?? undefined,
    })),
    { value: 'other', label: COPY.whoOther },
  ]

  return { say: [COPY.whoMany], ask: { kind: 'choices', choices }, next: 'whoPick' }
}

export const whoPick: ScenarioStep = async (context, answer) =>
  !answer || answer.value === 'other'
    ? { say: [], next: 'askWho' }
    : picked({ juniorId: answer.value, name: answer.label })

/**
 * On the file of a Junior, Memora offers her help before anything is said
 * @param {ScenarioContext} context - Member and data
 * @return {Promise<ScenarioMove>} - Oui or non
 */

export const fileOffer: ScenarioStep = async (context) => ({
  say: [fillTemplate(COPY.fileAsk, { name: context.data.name })],
  ask: {
    kind: 'choices',
    choices: [
      { value: 'yes', label: COPY.yes },
      { value: 'no', label: COPY.no },
    ],
  },
  next: 'fileAnswer',
})

export const fileAnswer: ScenarioStep = async (context, answer) =>
  answer?.value === 'yes' ? { say: [COPY.fileYes], next: 'hub' } : { say: [COPY.fileNo] }

/**
 * What can be done for the junior, only what their rights allow
 * @param {ScenarioContext} context - Member and data
 * @param {string} line - What Memora says first
 * @return {Promise<ScenarioMove>} - Choices
 */

const hubOf = async (
  context: { data: Record<string, string> },
  line: string
): Promise<ScenarioMove> => {
  const { can, junior } = await readDossier(context.data.juniorId)
  const choices: ScenarioChoice[] = [
    ...(can.edit ? [{ value: 'edit', label: COPY.hubEdit }] : []),
    ...(can.skill ? [{ value: 'skills', label: COPY.hubSkills }] : []),
    ...(can.note ? [{ value: 'note', label: COPY.hubNote }] : []),
    ...(can.objective ? [{ value: 'objectives', label: COPY.hubObjectives }] : []),
    ...(can.plan ? [{ value: 'plan', label: COPY.hubPlan }] : []),
    { value: 'steps', label: COPY.hubSteps },
    ...(can.follow && junior.trainer ? [{ value: 'trainer', label: COPY.hubTrainer }] : []),
    { value: 'done', label: COPY.hubDone },
  ]

  return {
    say: [fillTemplate(line, { name: context.data.name })],
    ask: { kind: 'choices', choices },
    next: 'hubAnswer',
  }
}

export const hub: ScenarioStep = (context) => hubOf(context, COPY.hubAsk)

export const hubAgain: ScenarioStep = (context) => hubOf(context, COPY.hubAgain)

// Step each gesture goes to
const WAYS: Record<string, string> = {
  edit: 'editStart',
  plan: 'planStart',
  skills: 'skillStart',
  note: 'noteMenu',
  objectives: 'objectiveMenu',
  steps: 'steps',
  trainer: 'trainerOfJunior',
}

export const hubAnswer: ScenarioStep = async (context, answer) => {
  const next = WAYS[answer?.value ?? '']

  return next ? { say: [], next } : { say: [COPY.hubBye] }
}

/**
 * The moments still to do for the junior, the member's side first
 * @param {ScenarioContext} context - Member and data
 * @return {Promise<ScenarioMove>} - Lines, then back to the hub
 */

export const steps: ScenarioStep = async (context) => {
  const { can, steps: journey } = await readDossier(context.data.juniorId)
  // A responsable sees theirs too, a trainer only the trainer's
  const owners: string[] = can.follow
    ? [StepOwners.Formateurs, StepOwners.Both, StepOwners.Responsable]
    : [StepOwners.Formateurs, StepOwners.Both]
  const todo = journey
    .filter((step) => step.state !== 'done' && step.owner && owners.includes(step.owner))
    .slice(0, ASSISTANT_SETTINGS.maxChoices)

  if (todo.length === 0) {
    return {
      say: [fillTemplate(COPY.stepsNone, { name: context.data.name })],
      next: 'hubAgain',
    }
  }

  return {
    say: [fillTemplate(COPY.stepsIntro, { name: context.data.name }), ...todo.map(stepSentence)],
    next: 'hubAgain',
  }
}

/**
 * The steps of the member across every Junior they follow
 * @return {Promise<ScenarioMove>} - One line per Junior
 */

export const mine: ScenarioStep = async () => {
  const { juniors } = await readFollow()
  if (juniors.length === 0) return { say: [COPY.stepsMineNone] }

  const busy = juniors.filter((junior) => junior.todo.length > 0)
  if (busy.length === 0) return { say: [COPY.stepsMineQuiet] }

  return {
    say: [
      COPY.stepsMineIntro,
      ...busy.slice(0, ASSISTANT_SETTINGS.maxChoices).map((junior) =>
        juniorLine(
          `${junior.todo
            .map((step) => stepSentence(step))
            .slice(0, 2)
            .join(' ')}`,
          junior.name,
          junior.sessionId,
          junior.juniorId
        )
      ),
    ],
  }
}
