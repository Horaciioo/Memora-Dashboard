import { apiGet, apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { failure } from '@/core/lib/assistant/scenarios/failure'
import { varied } from '@/core/lib/assistant/variants'
import { LIVE_VARIANTS } from '@/declarations/assistant/variants/live'
import { SCENARIO_COPY } from '@/declarations/assistant/scenarios/shared'
import { LIVE_SCENARIO_COPY as COPY } from '@/declarations/assistant/scenarios/live'
import type { AttendanceHours, AttendancePerson } from '@/types/calendar'
import type { LiveGroups } from '@/types/liveAsks'
import type { ScenarioGroup, ScenarioStep } from '@/types/scenario'
import { formatClock } from '@/utils/format/time/dates'
import { instantToWall, wallToInstant } from '@/utils/format/time/zone'
import { AttendanceStatuses } from '@/utils/constants/workflow'

// Answers of the two questions
const YES = 'yes'
const NO = 'no'

// Length of a live whose end is not known, in hours
const DEFAULT_HOURS = 3

// Day and hour spoken in a sentence, in the member's zone
const whenOf = (iso: string): string => {
  const wall = instantToWall(iso)
  const today = instantToWall(new Date()).slice(0, 10)
  const day =
    wall.slice(0, 10) === today ? 'ce soir' : `le ${wall.slice(8, 10)}/${wall.slice(5, 7)}`

  return `${day} à ${wall.slice(11, 13)}h${wall.slice(14, 16) === '00' ? '' : wall.slice(14, 16)}`
}

// Live asking the member, the member asked whether they come
export const liveAsk: ScenarioStep = async ({ data }) => ({
  say: [
    varied('live.asked', LIVE_VARIANTS.asked, {
      creator: data.creator,
      when: whenOf(data.startsAt),
    }),
  ],
  topic: data.title,
  ask: {
    kind: 'choices',
    choices: [
      { value: YES, label: COPY.askYes, tone: 'success' },
      { value: NO, label: COPY.askNo, tone: 'danger' },
    ],
  },
  next: 'liveAskAnswer',
})

// A no is sent right away, a yes asks for the hours first
export const liveAskAnswer: ScenarioStep = async ({ data }, answer) => {
  if (answer?.value !== YES) {
    try {
      await apiPost(API_ROUTES.calendarEntryAttendance(data.eventId), {
        status: AttendanceStatuses.Absent,
      })

      return { say: [varied('live.sentNo', LIVE_VARIANTS.sentNo)] }
    } catch (error) {
      return failure(error)
    }
  }

  const end =
    data.endsAt ||
    new Date(new Date(data.startsAt).getTime() + DEFAULT_HOURS * 3_600_000).toISOString()

  return {
    say: [varied('live.window', LIVE_VARIANTS.window)],
    ask: { kind: 'hours', from: instantToWall(data.startsAt), to: instantToWall(end) },
    next: 'liveAskHours',
  }
}

// The hours are sent with the presence
export const liveAskHours: ScenarioStep = async ({ data }, answer) => {
  const [from, to] = (answer?.value ?? '').split('/')
  if (!from || !to) return failure(new Error(SCENARIO_COPY.notUnderstood))

  try {
    await apiPost(API_ROUTES.calendarEntryAttendance(data.eventId), {
      status: AttendanceStatuses.Present,
      from: wallToInstant(from).toISOString(),
      to: wallToInstant(to).toISOString(),
    })

    return { say: [varied('live.sentYes', LIVE_VARIANTS.sentYes)] }
  } catch (error) {
    return failure(error)
  }
}

// What a person's hours say, when they gave any
const hoursOf = (hours: AttendanceHours | null): string =>
  hours ? ` (de ${formatClock(hours.from)} à ${formatClock(hours.to)})` : ''

export const linesOf = (people: AttendancePerson[], withHours: boolean): string[] =>
  people.map((person) => `${person.name}${withHours ? hoursOf(person.hours) : ''}`)

// One group, left out when nobody is in it
export const group = (
  tone: ScenarioGroup['tone'],
  title: string,
  items: string[]
): ScenarioGroup[] => (items.length > 0 ? [{ tone, title, items }] : [])

// Who runs the live offered the full list
export const liveRoster: ScenarioStep = async ({ data }) => ({
  say: [varied('live.fullList', LIVE_VARIANTS.fullList)],
  topic: data.title,
  ask: {
    kind: 'choices',
    choices: [
      { value: YES, label: SCENARIO_COPY.yes, tone: 'success' },
      { value: NO, label: SCENARIO_COPY.no },
    ],
  },
  next: 'liveRosterAnswer',
})

// The four lists, then the offer to remind who did not answer
export const liveRosterAnswer: ScenarioStep = async ({ data }, answer) => {
  if (answer?.value !== YES) return { say: [] }

  try {
    const groups = await apiGet<LiveGroups>(API_ROUTES.liveAskGroups(data.eventId))
    const lists: ScenarioGroup[] = [
      ...group('success', LIVE_VARIANTS.groupPresent, linesOf(groups.present, true)),
      ...group('danger', LIVE_VARIANTS.groupAbsent, linesOf(groups.absent, false)),
      ...group('muted', LIVE_VARIANTS.groupPending, linesOf(groups.pending, false)),
      ...group('plain', LIVE_VARIANTS.groupLeave, linesOf(groups.onLeave, false)),
    ]
    const intro = varied('live.listIntro', LIVE_VARIANTS.listIntro, { title: groups.title })
    const say = [{ text: intro, groups: lists }]

    if (groups.pending.length === 0) {
      return { say: [...say, varied('live.none', LIVE_VARIANTS.nobodyWaiting)] }
    }

    return {
      say: [...say, varied('live.remind', LIVE_VARIANTS.remind)],
      ask: {
        kind: 'choices',
        choices: [
          { value: YES, label: SCENARIO_COPY.yes, tone: 'success' },
          { value: NO, label: SCENARIO_COPY.no },
        ],
      },
      next: 'liveRemind',
    }
  } catch (error) {
    return failure(error)
  }
}

// The members who did not answer get their push
export const liveRemind: ScenarioStep = async ({ data }, answer) => {
  if (answer?.value !== YES) return { say: [] }

  try {
    await apiPost(API_ROUTES.calendarEntryReminder(data.eventId), {})

    return { say: [varied('live.reminded', LIVE_VARIANTS.reminded)] }
  } catch {
    // The same people were pinged a moment ago
    return { say: [varied('live.tooSoon', LIVE_VARIANTS.tooSoon)] }
  }
}
