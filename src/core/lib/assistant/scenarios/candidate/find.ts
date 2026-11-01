import { apiGet } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import {
  momentOf,
  namesOf,
  optionsOf,
  readCandidate,
} from '@/core/lib/assistant/scenarios/candidate/data'
import { CANDIDATE_SCENARIO_COPY as COPY } from '@/declarations/assistant/scenarios/candidate'
import { SCENARIO_COPY } from '@/declarations/assistant/scenarios/shared'
import { ASSISTANT_SETTINGS } from '@/declarations/assistant/settings'
import type { ScenarioChoice, ScenarioMove, ScenarioStep } from '@/types/scenario'
import { fillTemplate } from '@/utils/format/strings'

// One candidate found by the search
interface Found {
  candidateId: string
  name: string
  sessionName: string
}

const searchAsk = (): ScenarioMove['ask'] => ({ kind: 'search', placeholder: COPY.whoHint })

/**
 * Ask who is meant
 * @return {Promise<ScenarioMove>} - Search field
 */

export const askWho: ScenarioStep = async () => ({
  say: [COPY.who],
  ask: searchAsk(),
  next: 'whoAnswer',
})

/**
 * Candidate picked, on to what changes
 * @param {Found} found - Candidate
 * @return {ScenarioMove} - Move to the menu
 */

const picked = (found: { candidateId: string; name: string }): ScenarioMove => ({
  say: [fillTemplate(COPY.picked, { name: found.name })],
  next: 'menu',
  data: { candidateId: found.candidateId, name: found.name },
})

/**
 * Search the words, one hit goes straight on
 * @param {ScenarioContext} context - Member and data
 * @param {ScenarioAnswer | null} answer - Words typed
 * @return {Promise<ScenarioMove>} - Next move
 */

export const whoAnswer: ScenarioStep = async (context, answer) => {
  const text = answer?.value ?? ''
  const hits = await apiGet<Found[]>(`${API_ROUTES.candidateSearch}?q=${encodeURIComponent(text)}`)

  if (hits.length === 0) {
    return {
      say: [fillTemplate(COPY.whoNone, { text })],
      ask: searchAsk(),
      next: 'whoAnswer',
    }
  }
  if (hits.length === 1) return picked(hits[0])

  const shown = hits.slice(0, ASSISTANT_SETTINGS.maxChoices)
  const choices: ScenarioChoice[] = [
    ...shown.map((hit) => ({ value: hit.candidateId, label: hit.name, hint: hit.sessionName })),
    { value: 'other', label: COPY.whoOther },
  ]

  return {
    say: [
      hits.length > shown.length
        ? fillTemplate(COPY.whoTooMany, { shown: String(shown.length) })
        : COPY.whoMany,
    ],
    ask: { kind: 'choices', choices },
    next: 'whoPick',
  }
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
    : picked({ candidateId: answer.value, name: answer.label })

/**
 * What can change, the likely ones first and each with its current value
 * @param {ScenarioContext} context - Member and data
 * @return {Promise<ScenarioMove>} - Menu
 */

const propertyChoices = async (id: string): Promise<ScenarioChoice[]> => {
  const [candidate, outcomes] = await Promise.all([readCandidate(id), optionsOf(id, 'outcomeId')])
  const empty = COPY.empty

  const interview: ScenarioChoice = {
    value: 'interviewAt',
    label: COPY.interviewAt,
    hint: candidate.interviewAt ? momentOf(candidate.interviewAt) : empty,
  }
  const recruiters: ScenarioChoice = {
    value: 'recruiters',
    label: COPY.recruiters,
    hint: namesOf(candidate.recruiters),
  }
  const outcome: ScenarioChoice = {
    value: 'outcome',
    label: COPY.outcome,
    hint: outcomes.find((option) => option.value === candidate.outcomeId)?.label ?? empty,
  }
  const attended: ScenarioChoice = {
    value: 'attended',
    label: COPY.attended,
    hint: candidate.attended ? COPY.present : COPY.absent,
  }
  const isPast =
    Boolean(candidate.interviewAt) && Date.parse(candidate.interviewAt ?? '') < Date.now()

  // After the interview, the presence and the column matter most
  const likely = isPast
    ? [attended, outcome, interview, recruiters]
    : [interview, recruiters, outcome, ...(candidate.interviewAt ? [attended] : [])]

  return [
    ...likely,
    { value: 'observers', label: COPY.observers, hint: namesOf(candidate.observers) },
    { value: 'displayName', label: COPY.displayName, hint: candidate.displayName ?? empty },
    { value: 'formId', label: COPY.formId, hint: candidate.formId ?? empty },
    { value: 'discordId', label: COPY.discordId, hint: candidate.discordId },
  ]
}

export const menu: ScenarioStep = async (context) => {
  const choices = [
    ...(await propertyChoices(context.data.candidateId)),
    { value: 'done', label: COPY.done },
  ]

  return { say: [], ask: { kind: 'choices', choices }, next: 'menuAnswer' }
}

/**
 * On the file, Memora offers to update before anything is said
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
        ask: { kind: 'multi', choices: await propertyChoices(context.data.candidateId) },
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
  const way = WAYS[prop ?? '']
  if (!way) return { say: [fillTemplate(COPY.fileDone, { name: context.data.name })] }

  return { say: [], next: way.next, data: { ...way.data, queue: rest.join(',') } }
}

// Step each property goes to
const WAYS: Record<string, { next: string; data?: Record<string, string> }> = {
  interviewAt: { next: 'askInterview' },
  recruiters: { next: 'seatsMenu', data: { seat: 'recruiters' } },
  observers: { next: 'seatsMenu', data: { seat: 'observers' } },
  outcome: { next: 'askOutcome' },
  attended: { next: 'askAttended' },
  displayName: { next: 'askText', data: { prop: 'displayName' } },
  formId: { next: 'askText', data: { prop: 'formId' } },
  discordId: { next: 'askText', data: { prop: 'discordId' } },
}

/**
 * Go to the property picked, or finish
 * @param {ScenarioContext} context - Member and data
 * @param {ScenarioAnswer | null} answer - Property
 * @return {Promise<ScenarioMove>} - Next move
 */

export const menuAnswer: ScenarioStep = async (context, answer) => {
  const way = WAYS[answer?.value ?? '']
  if (!way) return { say: [fillTemplate(COPY.finished, { name: context.data.name })] }

  return { say: [], next: way.next, data: way.data }
}
