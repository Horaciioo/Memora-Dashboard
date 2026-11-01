import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { readMoment, readTime } from '@/core/lib/assistant/moment'
import { failure } from '@/core/lib/assistant/scenarios/failure'
import { readDossier } from '@/core/lib/assistant/scenarios/junior/data'
import { JUNIOR_SCENARIO_COPY as COPY } from '@/declarations/assistant/scenarios/junior'
import { ROUTES } from '@/declarations/navigation'
import { IDEMPOTENCY_HEADER } from '@/declarations/system/security/idempotency'
import type { ScenarioChoice, ScenarioMove, ScenarioStep } from '@/types/scenario'
import { fillTemplate } from '@/utils/format/strings'

// Lengths offered when the model has no usual one
const LENGTHS = [30, 60, 90]

// A wall clock moment moved by minutes
const endOf = (start: string, minutes: number): string =>
  new Date(Date.parse(`${start}:00Z`) + minutes * 60_000).toISOString().slice(0, 16)

// A wall clock moment in words, read as is
const whenOf = (wall: string): string =>
  new Date(`${wall}:00Z`).toLocaleString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  })

const lengthOf = (minutes: number): string =>
  minutes % 60 === 0 ? `${minutes / 60} h` : minutes > 60 ? `1 h ${minutes - 60}` : `${minutes} min`

/**
 * The templates open for the junior, one write key per try
 * @param {ScenarioContext} context - Member and data
 * @return {Promise<ScenarioMove>} - Templates, or why none
 */

export const planStart: ScenarioStep = async (context) => {
  const { agenda } = await readDossier(context.data.juniorId)
  const open = agenda.filter((option) => option.isOpen)

  if (open.length === 0) {
    return {
      say: [
        fillTemplate(COPY.planNone, { name: context.data.name }),
        ...agenda
          .filter((option) => option.hint)
          .map((option) => `${option.name} : ${option.hint}`),
      ],
      next: 'hubAgain',
    }
  }

  const choices: ScenarioChoice[] = open.map((option) => ({
    value: option.templateId,
    label: option.name,
  }))

  return {
    say: [COPY.planAsk],
    ask: { kind: 'choices', choices },
    next: 'planPick',
    data: { key: crypto.randomUUID() },
  }
}

export const planPick: ScenarioStep = async (context, answer) => {
  const { agenda } = await readDossier(context.data.juniorId)
  const picked = agenda.find((option) => option.templateId === answer?.value)

  return {
    say: [COPY.planWhen, COPY.planWhenHint],
    ask: { kind: 'text' },
    next: 'planWhen',
    data: {
      templateId: picked?.templateId ?? '',
      templateName: picked?.name ?? '',
      minutes: String(picked?.defaultMinutes ?? ''),
    },
  }
}

/**
 * Read day and hour, ask the missing hour
 * @param {ScenarioContext} context - Member and data
 * @param {ScenarioAnswer | null} answer - Words typed
 * @return {Promise<ScenarioMove>} - Next move
 */

export const planWhen: ScenarioStep = async (context, answer): Promise<ScenarioMove> => {
  const { day, time } = readMoment(answer?.value ?? '', context.today)

  if (!day) return { say: [COPY.planUnreadable], ask: { kind: 'text' }, next: 'planWhen' }
  if (!time) {
    return { say: [COPY.planNoTime], ask: { kind: 'text' }, next: 'planTime', data: { day } }
  }

  return { say: [], next: 'planLength', data: { start: `${day}T${time}` } }
}

export const planTime: ScenarioStep = async (context, answer) => {
  const time = readTime(answer?.value ?? '')
  if (!time) return { say: [COPY.planNoTime], ask: { kind: 'text' }, next: 'planTime' }

  return { say: [], next: 'planLength', data: { start: `${context.data.day}T${time}` } }
}

/**
 * Ask the length when the model has no usual one
 * @param {ScenarioContext} context - Member and data
 * @return {Promise<ScenarioMove>} - Lengths, or straight to the recap
 */

export const planLength: ScenarioStep = async (context) =>
  context.data.minutes
    ? { say: [], next: 'planRecap' }
    : {
        say: [COPY.planLength],
        ask: {
          kind: 'choices',
          choices: LENGTHS.map((minutes) => ({ value: String(minutes), label: lengthOf(minutes) })),
        },
        next: 'planLengthAnswer',
      }

export const planLengthAnswer: ScenarioStep = async (context, answer) => ({
  say: [],
  next: 'planRecap',
  data: { minutes: answer?.value ?? '60' },
})

/**
 * Sum up before writing on the calendar
 * @param {ScenarioContext} context - Member and data
 * @return {Promise<ScenarioMove>} - Recap and its two answers
 */

export const planRecap: ScenarioStep = async (context) => {
  const { data } = context

  return {
    say: [
      fillTemplate(COPY.planRecap, {
        template: data.templateName,
        name: data.name,
        when: whenOf(data.start),
        length: lengthOf(Number(data.minutes)),
      }),
      COPY.planRecapAsk,
    ],
    ask: {
      kind: 'choices',
      choices: [
        { value: 'go', label: COPY.planGo },
        { value: 'redo', label: COPY.planRedo },
      ],
    },
    next: 'planAnswer',
  }
}

export const planAnswer: ScenarioStep = async (context, answer) =>
  answer?.value === 'go'
    ? { say: [], next: 'planSave', thinking: true }
    : { say: [], next: 'planStart' }

/**
 * Post the entry on the calendar, the template fixes who is convened
 * @param {ScenarioContext} context - Member and data
 * @return {Promise<ScenarioMove>} - Done with its link, or why not
 */

export const planSave: ScenarioStep = async (context) => {
  const { data } = context
  const { junior } = await readDossier(data.juniorId)

  try {
    const created = await apiPost<{ id: string }>(
      API_ROUTES.calendarEntries,
      {
        title: `${data.templateName}, ${junior.displayName}`,
        templateId: data.templateId,
        juniorId: junior.id,
        sessionId: junior.sessionId,
        trainerId: junior.values.trainerId ?? undefined,
        startsAt: data.start,
        endsAt: endOf(data.start, Number(data.minutes)),
      },
      { [IDEMPOTENCY_HEADER]: data.key }
    )
    context.refresh()

    return {
      say: [
        {
          text: COPY.planDone,
          link: { label: data.templateName, href: ROUTES.calendarEvent(created.id) },
        },
        COPY.planSent,
      ],
      next: 'hubAgain',
    }
  } catch (error) {
    return { ...failure(error), next: 'hubAgain' }
  }
}
