import { apiGet, apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { failure } from '@/core/lib/assistant/scenarios/failure'
import { varied } from '@/core/lib/assistant/variants'
import { ASSISTANT_SETTINGS } from '@/declarations/assistant/settings'
import { LIVE_VARIANTS } from '@/declarations/assistant/variants/live'
import { SCENARIO_COPY } from '@/declarations/assistant/scenarios/shared'
import { LIVE_SCENARIO_COPY as COPY } from '@/declarations/assistant/scenarios/live'
import type { AttendanceHours, AttendancePerson } from '@/types/calendar'
import type { LiveGroups } from '@/types/liveAsks'
import type { ScenarioGroup, ScenarioStep } from '@/types/scenario'
import { HOUR_MS } from '@/utils/constants/time'
import { fillTemplate } from '@/utils/format/strings'
import { formatClock } from '@/utils/format/time/dates'
import { instantToWall, wallToInstant } from '@/utils/format/time/zone'
import { AttendanceStatuses } from '@/utils/constants/workflow'

// Answers of the question
const YES = 'yes'
const NO = 'no'
const MAYBE = 'maybe'

// Day and hour spoken in a sentence, in the member's zone
const whenOf = (iso: string): string => {
  const wall = instantToWall(iso)
  const today = instantToWall(new Date()).slice(0, 10)
  const day =
    wall.slice(0, 10) === today ? 'ce soir' : `le ${wall.slice(8, 10)}/${wall.slice(5, 7)}`

  return `${day} à ${wall.slice(11, 13)}h${wall.slice(14, 16) === '00' ? '' : wall.slice(14, 16)}`
}

// Live or event calling the roll, the member is asked whether they come
export const liveAsk: ScenarioStep = async ({ data }) => ({
  say: [data.question],
  topic: data.title,
  ask: {
    kind: 'choices',
    choices: [
      { value: YES, label: COPY.askYes },
      { value: NO, label: COPY.askNo },
      { value: MAYBE, label: COPY.askMaybe },
    ],
  },
  next: 'liveAskAnswer',
})

// A live asks for the hours, the end planned (or a few hours after the start) is already set
export const liveAskAnswer: ScenarioStep = async ({ data }, answer) => {
  if (answer?.value === MAYBE) return { say: [varied('live.undecided', LIVE_VARIANTS.undecided)] }

  if (answer?.value === YES && data.liveId) {
    const end =
      data.endsAt ||
      new Date(
        new Date(data.startsAt).getTime() + ASSISTANT_SETTINGS.liveDefaultHours * HOUR_MS
      ).toISOString()

    return {
      say: [varied('live.until', LIVE_VARIANTS.until)],
      ask: { kind: 'hours', from: instantToWall(data.startsAt), to: instantToWall(end) },
      next: 'liveAskHours',
    }
  }

  try {
    await apiPost(API_ROUTES.calendarEntryAttendance(data.eventId), {
      status: answer?.value === YES ? AttendanceStatuses.Present : AttendanceStatuses.Absent,
    })

    return {
      say: [
        answer?.value === YES
          ? varied('live.sentYes', LIVE_VARIANTS.sentYes)
          : varied('live.sentNo', LIVE_VARIANTS.sentNo),
      ],
    }
  } catch (error) {
    return failure(error)
  }
}

// The hours picked are sent with the presence
export const liveAskHours: ScenarioStep = async ({ data }, answer) => {
  const [from, to] = (answer?.value ?? '').split('/')
  if (!from || !to) return failure(new Error(SCENARIO_COPY.notUnderstood))

  const end = wallToInstant(to).toISOString()

  try {
    await apiPost(API_ROUTES.calendarEntryAttendance(data.eventId), {
      status: AttendanceStatuses.Present,
      from: wallToInstant(from).toISOString(),
      to: end,
    })

    return {
      say: [
        fillTemplate(COPY.untilNoted, { when: whenOf(end) }),
        varied('live.sentYes', LIVE_VARIANTS.sentYes),
      ],
    }
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
