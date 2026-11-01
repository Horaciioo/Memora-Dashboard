import { apiGet } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { editableProps, hintOf, readTaskFile } from '@/core/lib/assistant/scenarios/task/data'
import { TASK_SCENARIO_COPY as COPY } from '@/declarations/assistant/scenarios/task'
import { SCENARIO_COPY } from '@/declarations/assistant/scenarios/shared'
import { ASSISTANT_SETTINGS } from '@/declarations/assistant/settings'
import type { ScenarioChoice, ScenarioMove, ScenarioStep } from '@/types/scenario'
import { fillTemplate } from '@/utils/format/strings'

// One task found by the search
interface Found {
  taskId: string
  title: string
  hint: string | null
}

const searchAsk = (): ScenarioMove['ask'] => ({ kind: 'search', placeholder: COPY.whoHint })

/**
 * Ask which task is meant
 * @return {Promise<ScenarioMove>} - Search field
 */

export const askWho: ScenarioStep = async () => ({
  say: [COPY.who],
  ask: searchAsk(),
  next: 'whoAnswer',
})

const picked = (found: { taskId: string; name: string }): ScenarioMove => ({
  say: [fillTemplate(COPY.picked, { name: found.name })],
  next: 'menu',
  data: { taskId: found.taskId, name: found.name },
})

/**
 * Search the words, one hit goes straight on
 * @param {ScenarioContext} context - Member and data
 * @param {ScenarioAnswer | null} answer - Words typed
 * @return {Promise<ScenarioMove>} - Next move
 */

export const whoAnswer: ScenarioStep = async (context, answer) => {
  const text = answer?.value ?? ''
  const hits = await apiGet<Found[]>(`${API_ROUTES.taskSearch}?q=${encodeURIComponent(text)}`)

  if (hits.length === 0) {
    return { say: [fillTemplate(COPY.whoNone, { text })], ask: searchAsk(), next: 'whoAnswer' }
  }
  if (hits.length === 1) return picked({ taskId: hits[0].taskId, name: hits[0].title })

  const choices: ScenarioChoice[] = [
    ...hits.slice(0, ASSISTANT_SETTINGS.maxChoices).map((hit) => ({
      value: hit.taskId,
      label: hit.title,
      hint: hit.hint ?? undefined,
    })),
    { value: 'other', label: COPY.whoOther },
  ]

  return { say: [COPY.whoMany], ask: { kind: 'choices', choices }, next: 'whoPick' }
}

/**
 * One of the hits, or another search
 * @param {ScenarioContext} context - Member and data
 * @param {ScenarioAnswer | null} answer - Choice
 * @return {Promise<ScenarioMove>} - Next move
 */

export const whoPick: ScenarioStep = async (context, answer) =>
  !answer || answer.value === 'other'
    ? { say: [], next: 'askWho' }
    : picked({ taskId: answer.value, name: answer.label })

/**
 * Properties of the task with their value, the likely ones first
 * @param {string} id - Task identifier
 * @return {Promise<ScenarioChoice[]>} - Properties
 */

const propertyChoices = async (id: string): Promise<ScenarioChoice[]> => {
  const file = await readTaskFile(id)
  const { task } = file
  // A late task needs its date and state, an orphan its owner
  const first = task.isOverdue
    ? ['dueDate', 'stateId']
    : task.owner
      ? ['stateId', 'dueDate']
      : ['ownerId', 'stateId', 'dueDate']

  return editableProps(file)
    .map((prop) => ({ value: prop.key, label: prop.label, hint: hintOf(task, prop.key) }))
    .sort((left, right) => {
      const rank = (key: string) => (first.includes(key) ? first.indexOf(key) : first.length)

      return rank(left.value) - rank(right.value)
    })
}

/**
 * What can change on the task
 * @param {ScenarioContext} context - Member and data
 * @return {Promise<ScenarioMove>} - Menu
 */

export const menu: ScenarioStep = async (context) => ({
  say: [],
  ask: {
    kind: 'choices',
    choices: [...(await propertyChoices(context.data.taskId)), { value: 'done', label: COPY.done }],
  },
  next: 'menuAnswer',
})

/**
 * Go to the property picked, or finish
 * @param {ScenarioContext} context - Member and data
 * @param {ScenarioAnswer | null} answer - Property
 * @return {Promise<ScenarioMove>} - Next move
 */

export const menuAnswer: ScenarioStep = async (context, answer) =>
  !answer || answer.value === 'done'
    ? { say: [fillTemplate(COPY.finished, { name: context.data.name })] }
    : { say: [], next: 'askProp', data: { prop: answer.value } }

/**
 * On the file of a task, Memora offers to update before anything is said
 * @return {Promise<ScenarioMove>} - Oui or non
 */

export const fileOffer: ScenarioStep = async (context) => ({
  say: [fillTemplate(COPY.fileAsk, { name: context.data.name })],
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
 * Oui lists the properties to tick
 * @param {ScenarioContext} context - Member and data
 * @param {ScenarioAnswer | null} answer - Oui or non
 * @return {Promise<ScenarioMove>} - Properties, or a goodbye
 */

export const fileAnswer: ScenarioStep = async (context, answer) =>
  answer?.value === 'yes'
    ? {
        say: [COPY.fileWhich],
        ask: { kind: 'multi', choices: await propertyChoices(context.data.taskId) },
        next: 'fileProps',
      }
    : { say: [COPY.fileNo] }

/**
 * The ticked properties become a queue, asked one after the other
 * @param {ScenarioContext} context - Member and data
 * @param {ScenarioAnswer | null} answer - Properties, comma separated
 * @return {Promise<ScenarioMove>} - First of the queue
 */

export const fileProps: ScenarioStep = async (context, answer) => ({
  say: [COPY.fileGo],
  next: 'nextProp',
  data: { mode: 'queue', queue: answer?.value ?? '' },
})

/**
 * Next property of the queue, or the end
 * @param {ScenarioContext} context - Member and data
 * @return {Promise<ScenarioMove>} - Its question, or the end
 */

export const nextProp: ScenarioStep = async (context) => {
  const [prop, ...rest] = (context.data.queue ?? '').split(',').filter(Boolean)
  if (!prop) return { say: [fillTemplate(COPY.fileDone, { name: context.data.name })] }

  return { say: [], next: 'askProp', data: { prop, queue: rest.join(',') } }
}
