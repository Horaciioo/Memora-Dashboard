import { apiPatch } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { failure } from '@/core/lib/assistant/scenarios/failure'
import { optionsOf, readDossier } from '@/core/lib/assistant/scenarios/junior/data'
import { JUNIOR_SCENARIO_COPY as COPY } from '@/declarations/assistant/scenarios/junior'
import { ASSISTANT_SETTINGS } from '@/declarations/assistant/settings'
import type { ScenarioChoice, ScenarioStep } from '@/types/scenario'
import { fillTemplate, foldText } from '@/utils/format/strings'

// What a trainer or a responsable may change on the file, the status is a human's decision
const PROPS = [
  { key: 'trainerId', label: COPY.trainerId, isClearable: true },
  { key: 'dispositifId', label: COPY.dispositifId, isClearable: false },
]

/**
 * Properties of the junior with their value, as the tick list shows them
 * @param {ScenarioContext} context - Member and data
 * @return {Promise<ScenarioMove>} - Tick list
 */

export const editStart: ScenarioStep = async (context) => {
  const dossier = await readDossier(context.data.juniorId)
  const choices: ScenarioChoice[] = PROPS.map((prop) => ({
    value: prop.key,
    label: prop.label,
    hint:
      optionsOf(dossier, prop.key).find(
        (option) => option.value === dossier.junior.values[prop.key]
      )?.label ?? COPY.empty,
  }))

  return { say: [COPY.editWhich], ask: { kind: 'multi', choices }, next: 'editProps' }
}

export const editProps: ScenarioStep = async (context, answer) => ({
  say: [COPY.editGo],
  next: 'nextProp',
  data: { queue: answer?.value ?? '' },
})

/**
 * Next property of the queue, or back to the hub
 * @param {ScenarioContext} context - Member and data
 * @return {Promise<ScenarioMove>} - Its question, or the hub
 */

export const nextProp: ScenarioStep = async (context) => {
  const [prop, ...rest] = (context.data.queue ?? '').split(',').filter(Boolean)
  if (!prop) return { say: [], next: 'hubAgain' }

  return { say: [], next: 'askProp', data: { prop, queue: rest.join(',') } }
}

/**
 * Ask a property among the options of the form, a long list is searched
 * @param {ScenarioContext} context - Member and data
 * @return {Promise<ScenarioMove>} - Choices or search
 */

export const askProp: ScenarioStep = async (context) => {
  const prop = PROPS.find((entry) => entry.key === context.data.prop)!
  const options = optionsOf(await readDossier(context.data.juniorId), prop.key)
  const line = fillTemplate(COPY.pickAsk, { field: prop.label.toLowerCase() })

  if (options.length > ASSISTANT_SETTINGS.maxChoices) {
    return { say: [line], ask: { kind: 'search' }, next: 'propFind' }
  }

  const choices: ScenarioChoice[] = [
    ...options.map((option) => ({ value: option.value, label: option.label })),
    ...(prop.isClearable ? [{ value: '', label: COPY.pickNone }] : []),
  ]

  return { say: [line], ask: { kind: 'choices', choices }, next: 'propPick' }
}

export const propFind: ScenarioStep = async (context, answer) => {
  const text = foldText(answer?.value ?? '').trim()
  const hits = optionsOf(await readDossier(context.data.juniorId), context.data.prop).filter(
    (option) => foldText(option.label).includes(text)
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

/**
 * Write the change, the form replaces everything so the rest is sent back as it is
 * @param {ScenarioContext} context - Member and data
 * @param {ScenarioAnswer | null} answer - Option picked
 * @return {Promise<ScenarioMove>} - Done, or why not
 */

export const propPick: ScenarioStep = async (context, answer) => {
  const { junior } = await readDossier(context.data.juniorId)

  try {
    await apiPatch(API_ROUTES.junior(junior.id), {
      ...junior.values,
      [context.data.prop]: answer?.value || null,
    })
  } catch (error) {
    return { ...failure(error), next: 'nextProp' }
  }

  return { say: [COPY.noted], next: 'nextProp' }
}
