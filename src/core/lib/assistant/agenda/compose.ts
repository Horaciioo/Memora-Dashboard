import { varied } from '@/core/lib/assistant/variants'
import { AGENDA_COPY, AGENDA_VARIANTS } from '@/declarations/assistant/variants/agenda'
import { ASSISTANT_SETTINGS } from '@/declarations/assistant/settings'
import { ROUTES } from '@/declarations/navigation'
import type { AgendaFacts, AgendaPerson, AgendaSpan } from '@/types/agenda'
import type { AssistantSayLine } from '@/types/assistant'
import { formatWeekday, formatWeekdayTime } from '@/utils/format/time/dates'

/**
 * Days a span covers
 * @type {Record<AgendaSpan, number>}
 */

export const AGENDA_DAYS: Record<AgendaSpan, number> = { day: 1, week: 7 }

// Noon, so a zone never moves a bare day to its neighbour
const noon = (day: string): string => `${day}T12:00:00Z`

/**
 * Last day a span covers
 * @param {string} today - Wall day
 * @param {AgendaSpan} span - Window
 * @return {string} - Wall day
 */

export const lastDayOf = (today: string, span: AgendaSpan): string => {
  const end = new Date(noon(today))
  end.setUTCDate(end.getUTCDate() + AGENDA_DAYS[span] - 1)

  return end.toISOString().slice(0, 10)
}

// A day told as the member would say it
const dayWord = (day: string, today: string): string =>
  day === today ? AGENDA_COPY.today : formatWeekday(noon(day))

// Names joined as a sentence
const namesOf = (people: AgendaPerson[]): string =>
  people.length > 1
    ? `${people
        .slice(0, -1)
        .map((person) => person.name)
        .join(AGENDA_COPY.nameSeparator)}${AGENDA_COPY.nameJoin}${people.at(-1)?.name}`
    : (people[0]?.name ?? '')

// Wording of a task by how late it is
const taskKey = (
  dueDay: string | null,
  today: string
): 'taskOpen' | 'taskLate' | 'taskToday' | 'taskDue' => {
  if (dueDay === null) return 'taskOpen'
  if (dueDay < today) return 'taskLate'

  return dueDay === today ? 'taskToday' : 'taskDue'
}

/**
 * What a point says, ready to be spoken
 * @typedef {Object} Agenda
 * @property {number} count - Subjects told
 * @property {AssistantSayLine[]} lines - One idea per line
 * @property {string[]} replies - Answers offered after it
 */

export interface Agenda {
  count: number
  lines: AssistantSayLine[]
  replies: string[]
}

/**
 * Turn what waits for a member into the lines of a point
 * @param {AgendaFacts} facts - Tasks, plans, absences, birthdays
 * @param {string} today - Wall day
 * @param {AgendaSpan} span - Window told
 * @return {Agenda} - Lines and the way on
 */

export const composeAgenda = (facts: AgendaFacts, today: string, span: AgendaSpan): Agenda => {
  const last = lastDayOf(today, span)
  const isDay = span === 'day'
  const cap = ASSISTANT_SETTINGS.pointLines

  // Late first, then what is due soonest, then what has no day
  const rank = (day: string | null) => (day === null ? '9999' : day)
  const tasks = facts.tasks
    .filter((task) => task.dueDay === null || task.dueDay <= last)
    .sort((left, right) => rank(left.dueDay).localeCompare(rank(right.dueDay)))
  const plans = facts.plans
    .filter((plan) => plan.day >= today && plan.day <= last)
    .sort((left, right) => left.startsAt.localeCompare(right.startsAt))
  const birthdays = facts.birthdays.filter((entry) => entry.day >= today && entry.day <= last)
  const away = facts.away

  const count = tasks.length + plans.length + Number(away.length > 0) + Number(birthdays.length > 0)
  if (count === 0) {
    return {
      count,
      lines: [{ text: varied(isDay ? 'calmDay' : 'calmWeek', AGENDA_VARIANTS[isDay ? 'calmDay' : 'calmWeek']) }],
      replies: [AGENDA_COPY[isDay ? 'weekAsk' : 'dayAsk']],
    }
  }

  const opening = isDay
    ? count === 1
      ? AGENDA_VARIANTS.openDayOne
      : AGENDA_VARIANTS.openDay
    : count === 1
      ? AGENDA_VARIANTS.openWeekOne
      : AGENDA_VARIANTS.openWeek

  const taskLines = tasks.slice(0, cap).map((task): AssistantSayLine => {
    const values = { title: task.title, day: task.dueDay ? dayWord(task.dueDay, today) : '' }
    const key = taskKey(task.dueDay, today)

    return {
      text: varied(key, AGENDA_VARIANTS[key], values),
      link: { href: task.href, label: task.context || task.title },
    }
  })

  const planLines = plans.slice(0, cap).map(
    (plan): AssistantSayLine => ({
      text: varied('plan', AGENDA_VARIANTS.plan, {
        when: formatWeekdayTime(plan.startsAt),
        title: plan.title,
      }),
    })
  )

  const lines: AssistantSayLine[] = [
    { text: varied(isDay ? 'openDay' : 'openWeek', opening, { count: String(count) }) },
    ...taskLines,
    ...(tasks.length > cap
      ? [
          {
            text: varied('taskMore', AGENDA_VARIANTS.taskMore, { count: String(tasks.length - cap) }),
            link: { href: ROUTES.home, label: AGENDA_COPY.openTasks },
          },
        ]
      : []),
    ...planLines,
    ...(plans.length > cap
      ? [
          {
            text: varied('planMore', AGENDA_VARIANTS.planMore, { count: String(plans.length - cap) }),
            link: { href: ROUTES.calendar, label: AGENDA_COPY.openCalendar },
          },
        ]
      : []),
    ...(away.length > 0
      ? [
          {
            text: varied(
              away.length > 1 ? 'awayMany' : 'awayOne',
              away.length > 1 ? AGENDA_VARIANTS.awayMany : AGENDA_VARIANTS.awayOne,
              { names: namesOf(away) }
            ),
          },
        ]
      : []),
    ...birthdays.map((entry) => ({
      text: varied('birthday', AGENDA_VARIANTS.birthday, {
        names: entry.name,
        when: dayWord(entry.day, today),
      }),
    })),
    { text: varied(isDay ? 'end' : 'endWeek', AGENDA_VARIANTS[isDay ? 'end' : 'endWeek']) },
  ]

  return {
    count,
    lines,
    replies: [
      ...(plans.length > 0 ? [AGENDA_COPY.openCalendar] : []),
      AGENDA_COPY[isDay ? 'weekAsk' : 'dayAsk'],
    ],
  }
}
