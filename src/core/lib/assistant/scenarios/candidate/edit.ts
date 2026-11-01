import { failure } from '@/core/lib/assistant/scenarios/failure'
import { readMoment, readTime } from '@/core/lib/assistant/moment'
import {
  optionsOf,
  readCandidate,
  saveChange,
  SEAT_FIELDS,
  textLine,
} from '@/core/lib/assistant/scenarios/candidate/data'
import type { SeatKind } from '@/core/lib/assistant/scenarios/candidate/data'
import { CANDIDATE_SCENARIO_COPY as COPY } from '@/declarations/assistant/scenarios/candidate'
import { ASSISTANT_SETTINGS } from '@/declarations/assistant/settings'
import { SCENARIO_COPY } from '@/declarations/assistant/scenarios/shared'
import type { CandidateView } from '@/types/recruitment'
import type { ScenarioMove, ScenarioStep } from '@/types/scenario'
import { fillTemplate, foldText } from '@/utils/format/strings'

// Words that empty a property
const CLEARS = new Set(['aucun', 'aucune', 'rien', 'vide', 'non', 'personne'])

// Property of the form each text step writes, and its name in words
const TEXT_PROPS: Record<string, string> = {
  displayName: COPY.displayName,
  formId: COPY.formId,
  discordId: COPY.discordId,
}

/**
 * Step after a property
 * @param {ScenarioContext} context - Member and data
 * @return {string} - Queue or menu
 */

const back = (context: { data: Record<string, string> }): string =>
  context.data.mode === 'queue' ? 'nextProp' : 'menu'

/**
 * Write one change, then back to the menu
 * @param {ScenarioContext} context - Member and data
 * @param {Record<string, unknown>} change - Values replaced
 * @param {string} [next] - Step after, the menu by default
 * @return {Promise<ScenarioMove>} - Done, or why not
 */

const apply = async (
  context: { data: Record<string, string> },
  change: Record<string, unknown>,
  next?: string
): Promise<ScenarioMove> => {
  // On a file the properties come from a queue, else from the menu
  const to = next ?? back(context)
  try {
    await saveChange(await readCandidate(context.data.candidateId), change)
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
 * Ask the interview
 * @return {Promise<ScenarioMove>} - Question
 */

export const askInterview: ScenarioStep = async () => ({
  say: [COPY.interviewAsk, COPY.interviewHint],
  ask: { kind: 'text' },
  next: 'interviewAnswer',
})

/**
 * Read day and hour, ask the missing hour
 * @param {ScenarioContext} context - Member and data
 * @param {ScenarioAnswer | null} answer - Words typed
 * @return {Promise<ScenarioMove>} - Next move
 */

export const interviewAnswer: ScenarioStep = async (context, answer) => {
  const text = answer?.value ?? ''
  if (CLEARS.has(foldText(text).trim())) return apply(context, { interviewAt: null })

  const { day, time } = readMoment(text, context.today)
  if (!day) {
    return { say: [COPY.interviewUnreadable], ask: { kind: 'text' }, next: 'interviewAnswer' }
  }
  if (!time) {
    return {
      say: [COPY.interviewNoTime],
      ask: { kind: 'text' },
      next: 'interviewTime',
      data: { day },
    }
  }

  return apply(context, { interviewAt: `${day}T${time}` })
}

/**
 * The hour alone, the day is kept
 * @param {ScenarioContext} context - Member and data
 * @param {ScenarioAnswer | null} answer - Hour typed
 * @return {Promise<ScenarioMove>} - Next move
 */

export const interviewTime: ScenarioStep = async (context, answer) => {
  const time = readTime(answer?.value ?? '')
  if (!time) {
    return { say: [COPY.interviewNoTime], ask: { kind: 'text' }, next: 'interviewTime' }
  }

  return apply(context, { interviewAt: `${context.data.day}T${time}` })
}

/**
 * Ask the presence
 * @return {Promise<ScenarioMove>} - Oui or non
 */

export const askAttended: ScenarioStep = async () => ({
  say: [COPY.attendedAsk],
  ask: {
    kind: 'choices',
    choices: [
      { value: 'yes', label: SCENARIO_COPY.yes },
      { value: 'no', label: SCENARIO_COPY.no },
    ],
  },
  next: 'attendedAnswer',
})

export const attendedAnswer: ScenarioStep = async (context, answer) =>
  apply(context, { attended: answer?.value === 'yes' })

/**
 * Ask the column among those of the board
 * @param {ScenarioContext} context - Member and data
 * @return {Promise<ScenarioMove>} - Choices
 */

export const askOutcome: ScenarioStep = async (context) => {
  const options = await optionsOf(context.data.candidateId, 'outcomeId')

  return {
    say: [COPY.outcomeAsk],
    ask: {
      kind: 'choices',
      choices: [
        ...options.map((option) => ({ value: option.value, label: option.label })),
        { value: '', label: COPY.outcomeNone },
      ],
    },
    next: 'outcomeAnswer',
  }
}

export const outcomeAnswer: ScenarioStep = async (context, answer) =>
  apply(context, { outcomeId: answer?.value || null })

/**
 * Ask a text property, the identifier cannot be emptied
 * @param {ScenarioContext} context - Member and data
 * @return {Promise<ScenarioMove>} - Question
 */

export const askText: ScenarioStep = async (context) => ({
  say: [context.data.prop === 'discordId' ? COPY.idAsk : textLine(TEXT_PROPS[context.data.prop])],
  ask: { kind: 'text' },
  next: 'textAnswer',
})

export const textAnswer: ScenarioStep = async (context, answer) => {
  const text = (answer?.value ?? '').trim()
  const { prop } = context.data
  const isClear = CLEARS.has(foldText(text))

  if (prop === 'discordId' && isClear) return { say: [], next: 'askText' }

  return apply(context, { [prop]: isClear ? null : text })
}

/**
 * Members of a list, to remove or to add to
 * @param {ScenarioContext} context - Member and data
 * @return {Promise<ScenarioMove>} - Choices
 */

export const seatsMenu: ScenarioStep = async (context) => {
  const kind = context.data.seat as SeatKind
  const candidate = await readCandidate(context.data.candidateId)

  return {
    say: [
      fillTemplate(COPY.seatsAsk, {
        field: kind === 'recruiters' ? COPY.recruiters : COPY.observers,
      }),
    ],
    ask: {
      kind: 'choices',
      choices: [
        ...candidate[kind].map((seat) => ({
          value: `rm:${seat.id}`,
          label: fillTemplate(COPY.seatsRemove, { name: seat.label }),
        })),
        { value: 'add', label: COPY.seatsAdd },
        { value: 'done', label: COPY.done },
      ],
    },
    next: 'seatsAnswer',
  }
}

/**
 * Seats of the other list and of this one, as ids
 * @param {CandidateView} candidate - Candidate
 * @param {SeatKind} kind - List edited
 * @param {string[]} ids - New ids of that list
 * @return {Record<string, string[]>} - Change to write
 */

const seatChange = (candidate: CandidateView, kind: SeatKind, ids: string[]) => ({
  [SEAT_FIELDS[kind]]: ids,
})

export const seatsAnswer: ScenarioStep = async (context, answer) => {
  const value = answer?.value ?? 'done'
  const kind = context.data.seat as SeatKind

  if (value === 'done') {
    const to = back(context)

    return {
      say: to === 'menu' ? [fillTemplate(COPY.again, { name: context.data.name })] : [COPY.noted],
      next: to,
    }
  }
  if (value === 'add') {
    return { say: [COPY.seatsAddAsk], ask: { kind: 'search' }, next: 'seatsFind' }
  }

  const candidate = await readCandidate(context.data.candidateId)
  const left = candidate[kind].map((seat) => seat.id).filter((id) => id !== value.slice(3))

  return apply(context, seatChange(candidate, kind, left), 'seatsMenu')
}

/**
 * Look the member up among the options of the form
 * @param {ScenarioContext} context - Member and data
 * @param {ScenarioAnswer | null} answer - Words typed
 * @return {Promise<ScenarioMove>} - Hits to pick, or another try
 */

export const seatsFind: ScenarioStep = async (context, answer) => {
  const text = foldText(answer?.value ?? '').trim()
  const kind = context.data.seat as SeatKind
  const candidate = await readCandidate(context.data.candidateId)
  const taken = new Set([...candidate.recruiters, ...candidate.observers].map((seat) => seat.id))

  const hits = (await optionsOf(context.data.candidateId, SEAT_FIELDS[kind])).filter(
    (option) =>
      !option.disabled && !taken.has(option.value) && foldText(option.label).includes(text)
  )

  if (hits.length === 0 || hits.length > ASSISTANT_SETTINGS.maxChoices) {
    return {
      say: [
        hits.length === 0
          ? fillTemplate(COPY.seatsAddNone, { text: answer?.value ?? '' })
          : COPY.seatsTooMany,
      ],
      ask: { kind: 'search' },
      next: 'seatsFind',
    }
  }

  return {
    say: [],
    ask: { kind: 'choices', choices: hits.map((hit) => ({ value: hit.value, label: hit.label })) },
    next: 'seatsPick',
  }
}

export const seatsPick: ScenarioStep = async (context, answer) => {
  const kind = context.data.seat as SeatKind
  const candidate = await readCandidate(context.data.candidateId)
  const ids = [...candidate[kind].map((seat) => seat.id), answer?.value ?? '']

  return apply(context, seatChange(candidate, kind, ids), 'seatsMenu')
}
