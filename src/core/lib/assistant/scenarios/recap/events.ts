import { apiGet } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { group, linesOf, liveRemind } from '@/core/lib/assistant/scenarios/live/ask'
import type { RecapChapter } from '@/core/lib/recap/compose'
import { RECAP_TALK_COPY as COPY } from '@/declarations/assistant/scenarios/recapTalk'
import { SCENARIO_COPY } from '@/declarations/assistant/scenarios/shared'
import type { LiveGroups } from '@/types/liveAsks'
import type { ScenarioAsk, ScenarioMove, ScenarioStep } from '@/types/scenario'
import { fillTemplate } from '@/utils/format/strings'

// Answers of the reminder question
const YES = 'yes'

// What the member closes the subject with
const FINISH: ScenarioAsk = {
  kind: 'choices',
  choices: [
    { value: 'done', label: COPY.finish, tone: 'success' },
    { value: 'later', label: COPY.later },
  ],
}

// Roll-call threads sit on their event
const isRollCall = (beat: string): boolean => beat.startsWith('rollCall')

/**
 * Events whose answers came in
 * @param {RecapChapter} chapter - Events chapter
 * @return {string[]} - Event identifiers
 */

export const answeredEvents = (chapter: RecapChapter): string[] => [
  ...new Set(
    chapter.groups.flatMap((entry) =>
      entry.threads.flatMap((thread) =>
        thread.targetId && thread.beats.some((beat) => isRollCall(beat.beat))
          ? [thread.targetId]
          : []
      )
    )
  ),
]

/**
 * Chapter without its roll-call threads
 * @param {RecapChapter} chapter - Events chapter
 * @return {RecapChapter | null} - Rest, null when nothing is left
 */

export const withoutRollCalls = (chapter: RecapChapter): RecapChapter | null => {
  const groups = chapter.groups
    .map((entry) => ({
      ...entry,
      threads: entry.threads.filter(
        (thread) => !thread.beats.some((beat) => isRollCall(beat.beat))
      ),
    }))
    .filter((entry) => entry.threads.length > 0)

  return groups.length > 0 ? { ...chapter, groups } : null
}

// Next event, or the end of the subject
const onward = (data: Record<string, string>): ScenarioMove => {
  const index = Number(data.eventIndex) + 1
  if (index >= data.events.split(',').length) return { say: [], ask: FINISH, next: 'close' }

  return { say: [], data: { eventIndex: String(index) }, next: 'eventRoll' }
}

// One event: its title, the answers in three colours, then the offer to remind
export const eventRoll: ScenarioStep = async ({ data }) => {
  const eventId = data.events.split(',')[Number(data.eventIndex)]

  try {
    const groups = await apiGet<LiveGroups>(API_ROUTES.liveAskGroups(eventId))
    const count = groups.present.length + groups.absent.length
    const lists = [
      ...group('success', COPY.present, linesOf(groups.present, true)),
      ...group('danger', COPY.absent, linesOf(groups.absent, false)),
      ...group('muted', COPY.pending, linesOf(groups.pending, false)),
    ]
    const summary =
      count === 0
        ? COPY.eventNoReply
        : count === 1
          ? COPY.eventReply
          : fillTemplate(COPY.eventReplies, { count: String(count) })
    const say = [groups.title, { text: summary, groups: lists }]

    if (groups.pending.length === 0) {
      return { say: [...say, COPY.everyone], data: { eventId }, next: 'eventNext' }
    }

    return {
      say: [...say, COPY.remind],
      data: { eventId },
      ask: {
        kind: 'choices',
        choices: [
          { value: YES, label: SCENARIO_COPY.yes, tone: 'success' },
          { value: 'no', label: SCENARIO_COPY.no },
        ],
      },
      next: 'eventRemind',
    }
  } catch {
    // An event the member cannot see is left out
    return onward(data)
  }
}

// The ones who did not answer get their push, when asked
export const eventRemind: ScenarioStep = async (context, answer) => ({
  ...(await liveRemind(context, answer)),
  next: 'eventNext',
})

// On to the next event
export const eventNext: ScenarioStep = async ({ data }) => onward(data)
