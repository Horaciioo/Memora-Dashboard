import { extractDue } from '@/core/lib/assistant/dates'
import { tokenize } from '@/core/lib/assistant/normalize'
import { failure } from '@/core/lib/assistant/scenarios/failure'
import {
  optionsOf,
  readTaskFile,
  saveChange,
  TASK_PROPS,
  textLine,
} from '@/core/lib/assistant/scenarios/task/data'
import { TASK_SCENARIO_COPY as COPY } from '@/declarations/assistant/scenarios/task'
import { ASSISTANT_SETTINGS } from '@/declarations/assistant/settings'
import type { ScenarioChoice, ScenarioMove, ScenarioStep } from '@/types/scenario'
import { fillTemplate, foldText } from '@/utils/format/strings'

// Words that empty a property
const CLEARS = new Set(['aucun', 'aucune', 'rien', 'vide', 'non', 'personne'])

const propOf = (key: string) => TASK_PROPS.find((prop) => prop.key === key)!

/**
 * Step after a property, the queue of a file or the menu
 * @param {ScenarioContext} context - Member and data
 * @return {string} - Step
 */

const back = (context: { data: Record<string, string> }): string =>
  context.data.mode === 'queue' ? 'nextProp' : 'menu'

/**
 * Write one change, then on to the next property
 * @param {ScenarioContext} context - Member and data
 * @param {Record<string, unknown>} change - Values replaced
 * @param {string} [next] - Step after, the queue or the menu by default
 * @return {Promise<ScenarioMove>} - Done, or why not
 */

const apply = async (
  context: { data: Record<string, string> },
  change: Record<string, unknown>,
  next?: string
): Promise<ScenarioMove> => {
  const to = next ?? back(context)

  try {
    await saveChange((await readTaskFile(context.data.taskId)).task, change)
  } catch (error) {
    return { ...failure(error), next: to }
  }

  const say =
    to === 'menu'
      ? [fillTemplate(COPY.again, { name: context.data.name })]
      : to === 'nextProp'
        ? [COPY.noted]
        : []

  return { say, next: to }
}

/**
 * Ask the property the way its kind needs
 * @param {ScenarioContext} context - Member and data
 * @return {Promise<ScenarioMove>} - Its question
 */

export const askProp: ScenarioStep = async (context) => {
  const prop = propOf(context.data.prop)

  if (prop.kind === 'text') {
    const line = prop.key === 'title' ? COPY.titleAsk : textLine(prop.label)

    return { say: [line], ask: { kind: 'text' }, next: 'propText' }
  }
  if (prop.kind === 'date') {
    return { say: [COPY.dateAsk, COPY.dateHint], ask: { kind: 'text' }, next: 'propDate' }
  }
  if (prop.kind === 'multi') return { say: [], next: 'multiMenu' }

  const file = await readTaskFile(context.data.taskId)
  const options = optionsOf(file, prop.key)
  const line = fillTemplate(COPY.pickAsk, { field: prop.label.toLowerCase() })

  // A long list is searched, a short one is shown
  if (options.length > ASSISTANT_SETTINGS.maxChoices) {
    return { say: [COPY.pickSearch], ask: { kind: 'search' }, next: 'propFind' }
  }

  const choices: ScenarioChoice[] = [
    ...options.map((option) => ({ value: option.value, label: option.label })),
    ...(prop.isClearable ? [{ value: '', label: COPY.pickNone }] : []),
  ]

  return { say: [line], ask: { kind: 'choices', choices }, next: 'propPick' }
}

/**
 * A text typed, the title cannot be emptied
 * @param {ScenarioContext} context - Member and data
 * @param {ScenarioAnswer | null} answer - Words typed
 * @return {Promise<ScenarioMove>} - Done, or asked again
 */

export const propText: ScenarioStep = async (context, answer) => {
  const text = (answer?.value ?? '').trim()
  const { prop } = context.data
  const isClear = CLEARS.has(foldText(text))

  if (isClear && !propOf(prop).isClearable) return { say: [], next: 'askProp' }

  return apply(context, { [prop]: isClear ? null : text })
}

/**
 * A day typed in words
 * @param {ScenarioContext} context - Member and data
 * @param {ScenarioAnswer | null} answer - Words typed
 * @return {Promise<ScenarioMove>} - Done, or asked again
 */

export const propDate: ScenarioStep = async (context, answer) => {
  const text = answer?.value ?? ''
  if (CLEARS.has(foldText(text).trim())) return apply(context, { dueDate: null })

  const day = extractDue(tokenize(text), context.today)?.value
  if (!day) {
    return { say: [COPY.dateUnreadable], ask: { kind: 'text' }, next: 'propDate' }
  }

  return apply(context, { dueDate: day })
}

/**
 * Look an option up in a long list
 * @param {ScenarioContext} context - Member and data
 * @param {ScenarioAnswer | null} answer - Words typed
 * @return {Promise<ScenarioMove>} - Hits to pick, or another try
 */

export const propFind: ScenarioStep = async (context, answer) => {
  const text = foldText(answer?.value ?? '').trim()
  const file = await readTaskFile(context.data.taskId)
  const hits = optionsOf(file, context.data.prop).filter((option) =>
    foldText(option.label).includes(text)
  )

  if (hits.length === 0 || hits.length > ASSISTANT_SETTINGS.maxChoices) {
    return {
      say: [
        hits.length === 0
          ? fillTemplate(COPY.pickEmpty, { text: answer?.value ?? '' })
          : COPY.pickTooMany,
      ],
      ask: { kind: 'search' },
      next: 'propFind',
    }
  }

  return {
    say: [],
    ask: { kind: 'choices', choices: hits.map((hit) => ({ value: hit.value, label: hit.label })) },
    next: 'propPick',
  }
}

export const propPick: ScenarioStep = async (context, answer) =>
  apply(context, { [context.data.prop]: answer?.value || null })

/**
 * Creators of the task, to remove or to add to
 * @param {ScenarioContext} context - Member and data
 * @return {Promise<ScenarioMove>} - Choices
 */

export const multiMenu: ScenarioStep = async (context) => {
  const { task } = await readTaskFile(context.data.taskId)

  return {
    say: [fillTemplate(COPY.multiAsk, { field: COPY.youtuberIds })],
    ask: {
      kind: 'choices',
      choices: [
        ...task.youtubers.map((creator) => ({
          value: `rm:${creator.id}`,
          label: fillTemplate(COPY.multiRemove, { name: creator.label }),
        })),
        { value: 'add', label: COPY.multiAdd },
        { value: 'done', label: COPY.done },
      ],
    },
    next: 'multiAnswer',
  }
}

export const multiAnswer: ScenarioStep = async (context, answer) => {
  const value = answer?.value ?? 'done'

  if (value === 'done') {
    const to = back(context)

    return {
      say: to === 'menu' ? [fillTemplate(COPY.again, { name: context.data.name })] : [COPY.noted],
      next: to,
    }
  }
  if (value === 'add') return { say: [], ask: { kind: 'search' }, next: 'multiFind' }

  const { task } = await readTaskFile(context.data.taskId)
  const left = task.youtubers.map((creator) => creator.id).filter((id) => id !== value.slice(3))

  return apply(context, { youtuberIds: left }, 'multiMenu')
}

/**
 * Look a creator up among those the member may pick
 * @param {ScenarioContext} context - Member and data
 * @param {ScenarioAnswer | null} answer - Words typed
 * @return {Promise<ScenarioMove>} - Hits to pick, or another try
 */

export const multiFind: ScenarioStep = async (context, answer) => {
  const text = foldText(answer?.value ?? '').trim()
  const file = await readTaskFile(context.data.taskId)
  const taken = new Set(file.task.youtubers.map((creator) => creator.id))
  const hits = optionsOf(file, 'youtuberIds').filter(
    (option) => !taken.has(option.value) && foldText(option.label).includes(text)
  )

  if (hits.length === 0 || hits.length > ASSISTANT_SETTINGS.maxChoices) {
    return {
      say: [
        hits.length === 0
          ? fillTemplate(COPY.pickEmpty, { text: answer?.value ?? '' })
          : COPY.pickTooMany,
      ],
      ask: { kind: 'search' },
      next: 'multiFind',
    }
  }

  return {
    say: [],
    ask: { kind: 'choices', choices: hits.map((hit) => ({ value: hit.value, label: hit.label })) },
    next: 'multiPick',
  }
}

export const multiPick: ScenarioStep = async (context, answer) => {
  const { task } = await readTaskFile(context.data.taskId)
  const ids = [...task.youtubers.map((creator) => creator.id), answer?.value ?? '']

  return apply(context, { youtuberIds: ids }, 'multiMenu')
}
