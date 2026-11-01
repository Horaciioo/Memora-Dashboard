import { apiPatch, apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { extractDue } from '@/core/lib/assistant/dates'
import { tokenize } from '@/core/lib/assistant/normalize'
import { failure } from '@/core/lib/assistant/scenarios/failure'
import { readDossier, readObjectives } from '@/core/lib/assistant/scenarios/junior/data'
import { JUNIOR_SCENARIO_COPY as COPY } from '@/declarations/assistant/scenarios/junior'
import { ASSISTANT_SETTINGS } from '@/declarations/assistant/settings'
import { ObjectiveStatuses } from '@/utils/constants/hierarchy'
import type { ScenarioChoice, ScenarioMove, ScenarioStep } from '@/types/scenario'
import { fillTemplate, foldText } from '@/utils/format/strings'

// Words that leave the date empty
const NONE = new Set(['aucune', 'aucun', 'rien', 'non', 'pas'])

/**
 * Objectives wait for the second period, Memora says it before anything else
 * @param {ScenarioContext} context - Member and data
 * @return {Promise<ScenarioMove>} - The reason, or the choices
 */

export const objectiveMenu: ScenarioStep = async (context) => {
  const dossier = await readDossier(context.data.juniorId)
  const { name } = context.data

  if (!dossier.isObjectivesOpen) {
    return { say: [fillTemplate(COPY.objectiveLocked, { name })], next: 'hubAgain' }
  }

  const hasAny = (await readObjectives(context.data.juniorId)).length > 0
  const choices: ScenarioChoice[] = [
    { value: 'add', label: COPY.objectiveAdd },
    ...(hasAny ? [{ value: 'edit', label: COPY.objectiveEdit }] : []),
    { value: 'back', label: COPY.done },
  ]

  return {
    say: [fillTemplate(COPY.objectiveAsk, { name })],
    ask: { kind: 'choices', choices },
    next: 'objectiveMenuAnswer',
  }
}

export const objectiveMenuAnswer: ScenarioStep = async (context, answer) => {
  if (answer?.value === 'add') return { say: [], next: 'objectiveAdd' }
  if (answer?.value !== 'edit') return { say: [], next: 'hubAgain' }

  const objectives = (await readObjectives(context.data.juniorId)).slice(
    0,
    ASSISTANT_SETTINGS.maxChoices
  )

  return {
    say: [COPY.objectiveWhich],
    ask: {
      kind: 'choices',
      choices: objectives.map((objective) => ({ value: objective.id, label: objective.title })),
    },
    next: 'objectiveEditPick',
  }
}

export const objectiveAdd: ScenarioStep = async () => ({
  say: [COPY.objectiveTitle],
  ask: { kind: 'text' },
  next: 'objectiveTitle',
})

export const objectiveTitle: ScenarioStep = async (context, answer) => ({
  say: [COPY.objectiveDue, COPY.objectiveDueHint],
  ask: { kind: 'text' },
  next: 'objectiveDue',
  data: { title: (answer?.value ?? '').trim() },
})

/**
 * Read the date, then write the objective as one in course
 * @param {ScenarioContext} context - Member and data
 * @param {ScenarioAnswer | null} answer - Words typed
 * @return {Promise<ScenarioMove>} - Done, or why not
 */

export const objectiveDue: ScenarioStep = async (context, answer): Promise<ScenarioMove> => {
  const text = answer?.value ?? ''
  const isNone = NONE.has(foldText(text).trim())
  const day = isNone ? null : (extractDue(tokenize(text), context.today)?.value ?? undefined)

  if (day === undefined) {
    return { say: [COPY.objectiveDueUnreadable], ask: { kind: 'text' }, next: 'objectiveDue' }
  }

  const { title } = context.data

  try {
    await apiPost(API_ROUTES.juniorObjectives(context.data.juniorId), {
      title,
      dueAt: day,
      status: ObjectiveStatuses.Open,
    })
  } catch (error) {
    return { ...failure(error), next: 'hubAgain' }
  }

  return {
    say: [fillTemplate(COPY.objectiveDone, { title, name: context.data.name })],
    next: 'hubAgain',
  }
}

export const objectiveEditPick: ScenarioStep = async (context, answer) => ({
  say: [COPY.objectiveWhat],
  ask: {
    kind: 'choices',
    choices: [
      { value: 'title', label: COPY.objectiveWhatTitle },
      { value: 'dueAt', label: COPY.objectiveWhatDue },
      { value: 'status', label: COPY.objectiveWhatStatus },
    ],
  },
  next: 'objectiveEditWhat',
  data: { objectiveId: answer?.value ?? '' },
})

export const objectiveEditWhat: ScenarioStep = async (context, answer) => {
  if (answer?.value === 'dueAt') {
    return {
      say: [COPY.objectiveDue, COPY.objectiveDueHint],
      ask: { kind: 'text' },
      next: 'objectiveEditDue',
    }
  }
  if (answer?.value === 'status') {
    const dossier = await readDossier(context.data.juniorId)
    const options = dossier.objectiveFields.find((field) => field.name === 'status')?.options ?? []

    return {
      say: [COPY.objectiveNewStatus],
      ask: {
        kind: 'choices',
        choices: options.map((option) => ({ value: option.value, label: option.label })),
      },
      next: 'objectiveEditStatus',
    }
  }

  return { say: [COPY.objectiveNewTitle], ask: { kind: 'text' }, next: 'objectiveEditTitle' }
}

/**
 * Write the change, the form replaces everything so the rest is sent back as it is
 * @param {ScenarioContext} context - Member and data
 * @param {Record<string, unknown>} change - Values replaced
 * @return {Promise<ScenarioMove>} - Done, or why not
 */

const saveObjective = async (
  context: { data: Record<string, string> },
  change: Record<string, unknown>
): Promise<ScenarioMove> => {
  const objective = (await readObjectives(context.data.juniorId)).find(
    (entry) => entry.id === context.data.objectiveId
  )
  if (!objective) return { say: [], next: 'hubAgain' }

  try {
    await apiPatch(API_ROUTES.objective(objective.id), { ...objective.values, ...change })
  } catch (error) {
    return { ...failure(error), next: 'hubAgain' }
  }

  return {
    say: [fillTemplate(COPY.objectiveEdited, { title: String(change.title ?? objective.title) })],
    next: 'hubAgain',
  }
}

export const objectiveEditTitle: ScenarioStep = async (context, answer) =>
  saveObjective(context, { title: (answer?.value ?? '').trim() })

export const objectiveEditStatus: ScenarioStep = async (context, answer) =>
  saveObjective(context, { status: answer?.value })

export const objectiveEditDue: ScenarioStep = async (context, answer): Promise<ScenarioMove> => {
  const text = answer?.value ?? ''
  const isNone = NONE.has(foldText(text).trim())
  const day = isNone ? null : (extractDue(tokenize(text), context.today)?.value ?? undefined)

  if (day === undefined) {
    return { say: [COPY.objectiveDueUnreadable], ask: { kind: 'text' }, next: 'objectiveEditDue' }
  }

  return saveObjective(context, { dueAt: day })
}
