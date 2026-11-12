import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { readMoment, readTime } from '@/core/lib/assistant/moment'
import { failure } from '@/core/lib/assistant/scenarios/failure'
import {
  lengthOf,
  platformName,
  readPlanning,
  whenOf,
} from '@/core/lib/assistant/scenarios/live/shared'
import { LIVE_SCENARIO_COPY as COPY } from '@/declarations/assistant/scenarios/live'
import { ROUTES } from '@/declarations/navigation'
import { IDEMPOTENCY_HEADER } from '@/declarations/system/security/idempotency'
import type { ScenarioMove, ScenarioStep } from '@/types/scenario'
import { MINUTE_MS } from '@/utils/constants/time'
import { fillTemplate } from '@/utils/format/strings'

// Lengths offered, in minutes
const LENGTHS = [60, 120, 180, 240]

// A wall clock moment moved by minutes
const endOf = (start: string, minutes: number): string =>
  new Date(Date.parse(`${start}:00Z`) + minutes * MINUTE_MS).toISOString().slice(0, 16)

/**
 * Ask the platform, one write key per try
 * @return {Promise<ScenarioMove>} - Platforms, or why none
 */

export const createStart: ScenarioStep = async () => {
  const { platforms } = await readPlanning()
  if (platforms.length === 0) return { say: [COPY.platformNone] }

  return {
    say: [COPY.platformAsk],
    ask: {
      kind: 'choices',
      choices: platforms.map((entry) => ({
        value: entry.templateId,
        label: platformName(entry.platform),
      })),
    },
    next: 'platformAnswer',
    data: { key: crypto.randomUUID() },
  }
}

/**
 * Platform picked, ask the creator unless there is only one
 * @param {ScenarioContext} context - Member and data
 * @param {ScenarioAnswer | null} answer - Template identifier
 * @return {Promise<ScenarioMove>} - Creators, or straight on
 */

export const platformAnswer: ScenarioStep = async (context, answer) => {
  const { platforms, creators } = await readPlanning()
  const picked = platforms.find((entry) => entry.templateId === answer?.value)
  const data = { templateId: picked?.templateId ?? '', platform: picked?.platform ?? '' }

  if (creators.length === 0) return { say: [COPY.creatorNone] }
  if (creators.length === 1) {
    return {
      say: [],
      next: 'creatorAnswer',
      data: { ...data, creatorId: creators[0].id, creatorName: creators[0].name },
    }
  }

  return {
    say: [COPY.creatorAsk],
    ask: {
      kind: 'choices',
      choices: creators.map((creator) => ({ value: creator.id, label: creator.name })),
    },
    next: 'creatorAnswer',
    data,
  }
}

export const creatorAnswer: ScenarioStep = async (context, answer): Promise<ScenarioMove> => {
  const { creators } = await readPlanning()
  const picked = creators.find((creator) => creator.id === answer?.value)

  return {
    say: [COPY.whenAsk, COPY.whenHint],
    ask: { kind: 'text' },
    next: 'whenAnswer',
    // A creator chosen before wins over the lone one
    data: picked ? { creatorId: picked.id, creatorName: picked.name } : {},
  }
}

/**
 * Read day and hour, ask the missing hour
 * @param {ScenarioContext} context - Member and data
 * @param {ScenarioAnswer | null} answer - Words typed
 * @return {Promise<ScenarioMove>} - Next move
 */

export const whenAnswer: ScenarioStep = async (context, answer): Promise<ScenarioMove> => {
  const { day, time } = readMoment(answer?.value ?? '', context.today)

  if (!day) return { say: [COPY.whenUnreadable], ask: { kind: 'text' }, next: 'whenAnswer' }
  if (!time)
    return { say: [COPY.timeAsk], ask: { kind: 'text' }, next: 'timeAnswer', data: { day } }

  return { say: [], next: 'lengthAsk', data: { start: `${day}T${time}` } }
}

export const timeAnswer: ScenarioStep = async (context, answer) => {
  const time = readTime(answer?.value ?? '')
  if (!time) return { say: [COPY.timeAsk], ask: { kind: 'text' }, next: 'timeAnswer' }

  return { say: [], next: 'lengthAsk', data: { start: `${context.data.day}T${time}` } }
}

export const lengthAsk: ScenarioStep = async () => ({
  say: [COPY.lengthAsk],
  ask: {
    kind: 'choices',
    choices: LENGTHS.map((minutes) => ({ value: String(minutes), label: lengthOf(minutes) })),
  },
  next: 'lengthAnswer',
})

export const lengthAnswer: ScenarioStep = async (context, answer) => ({
  say: [],
  next: 'recap',
  data: { minutes: answer?.value ?? '120' },
})

/**
 * Sum up before writing on the calendar
 * @param {ScenarioContext} context - Member and data
 * @return {Promise<ScenarioMove>} - Recap and its two answers
 */

export const recap: ScenarioStep = async ({ data }) => ({
  say: [
    fillTemplate(COPY.recap, {
      platform: platformName(data.platform),
      creator: data.creatorName,
      when: whenOf(data.start),
      length: lengthOf(Number(data.minutes)),
    }),
    COPY.recapAsk,
  ],
  ask: {
    kind: 'choices',
    choices: [
      { value: 'go', label: COPY.go, tone: 'success' },
      { value: 'redo', label: COPY.redo, tone: 'danger' },
    ],
  },
  next: 'recapAnswer',
})

export const recapAnswer: ScenarioStep = async (context, answer) =>
  answer?.value === 'go'
    ? { say: [], next: 'save', thinking: true }
    : { say: [], next: 'createStart' }

/**
 * Post the live on the calendar
 * @param {ScenarioContext} context - Member and data
 * @return {Promise<ScenarioMove>} - Done with its link, or why not
 */

export const save: ScenarioStep = async (context) => {
  const { data } = context

  try {
    const created = await apiPost<{ id: string }>(
      API_ROUTES.calendarEntries,
      {
        title: fillTemplate(COPY.title, { creator: data.creatorName }),
        templateId: data.templateId,
        youtuberId: data.creatorId,
        startsAt: data.start,
        endsAt: endOf(data.start, Number(data.minutes)),
      },
      { [IDEMPOTENCY_HEADER]: data.key }
    )
    context.refresh()

    return {
      say: [
        { text: COPY.done, link: { label: COPY.doneLink, href: ROUTES.calendarEvent(created.id) } },
      ],
    }
  } catch (error) {
    return failure(error)
  }
}
