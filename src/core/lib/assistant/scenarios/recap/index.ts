import { apiGet } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import {
  answeredEvents,
  eventNext,
  eventRemind,
  eventRoll,
  withoutRollCalls,
} from '@/core/lib/assistant/scenarios/recap/events'
import { menu, settle, settleAnswer, todosOf } from '@/core/lib/assistant/scenarios/recap/settle'
import { chaptersOf } from '@/core/lib/recap/compose'
import type { RecapChapter } from '@/core/lib/recap/compose'
import { useRecapAgenda } from '@/core/store/recapAgenda'
import { useRecapStore } from '@/core/store/recap'
import { RECAP_SETTINGS } from '@/declarations/configurations/settings'
import {
  RECAP_CHAPTERS,
  RECAP_CHAPTER_GO,
  RECAP_CHAPTER_PREPARING,
} from '@/declarations/recap/chapters'
import type { RecapChapterName } from '@/declarations/recap/chapters'
import { RECAP_TALK_COPY as COPY } from '@/declarations/assistant/scenarios/recapTalk'
import type { Recap } from '@/types/recap'
import type { Scenario, ScenarioLine, ScenarioMove, ScenarioStep } from '@/types/scenario'
import { DAY_MS } from '@/utils/constants/time'
import { fillTemplate } from '@/utils/format/strings'

// Recap kept by the store, or the last days when none was loaded
const loadRecap = async (): Promise<Recap> => {
  const store = useRecapStore.getState()
  if (store.recap) return store.recap

  const from = new Date(Date.now() - RECAP_SETTINGS.manualWindowDays * DAY_MS).toISOString()
  const recap = await apiGet<Recap>(API_ROUTES.recap({ from }))
  store.show(recap, true)

  return recap
}

// One line per chapter, the chapter drawn under it
const chapterLine = (chapter: RecapChapter): ScenarioLine => ({
  text: RECAP_CHAPTER_GO[chapter.chapter],
  recap: chapter,
})

// Chapters of the member's recap, absences left to their own talk
const chaptersToTell = async (): Promise<RecapChapter[]> => {
  const recap = await loadRecap()

  return chaptersOf(recap.threads, RECAP_SETTINGS.chapterLines).filter(
    ({ chapter }) => chapter !== 'absences'
  )
}

// Opens by asking which subject to start with, each pick leads to its own sub-talk
const open: ScenarioStep = async ({ name }) => {
  const chapters = await chaptersToTell()
  useRecapAgenda.getState().set(chapters.map(({ chapter }) => chapter))
  if (chapters.length === 0) return { say: [COPY.nothing] }

  return {
    say: [fillTemplate(COPY.hello, { name }), COPY.intro],
    ask: {
      kind: 'choices',
      choices: chapters.map(({ chapter }) => ({
        value: chapter,
        label: RECAP_CHAPTERS[chapter],
      })),
    },
    next: 'pick',
  }
}

// The subject said aloud by the member is told right away
const pick: ScenarioStep = async (context, answer) => ({
  say: [],
  data: { chapter: answer?.value ?? '' },
  next: 'alone',
})

// One subject told alone, Memora stays on it until the member closes it
const alone: ScenarioStep = async ({ data }) => {
  const chosen = (await chaptersToTell()).find(({ chapter }) => chapter === data.chapter)
  if (!chosen) return { say: [COPY.nothing] }

  useRecapAgenda.getState().focus(chosen.chapter)
  const events = chosen.chapter === 'events' ? answeredEvents(chosen) : []
  if (events.length > 0) return eventsOpening(chosen, events)

  // What waits for the member is offered to be done in their place
  return {
    topic: RECAP_CHAPTERS[chosen.chapter],
    say: [chapterLine(chosen)],
    data: { todos: todosOf(chosen), todoIndex: '0', kept: '' },
    next: 'settle',
  }
}

// Events with answers get their own report, the rest is told as usual
const eventsOpening = (chosen: RecapChapter, events: string[]): ScenarioMove => {
  const rest = withoutRollCalls(chosen)

  return {
    topic: RECAP_CHAPTERS.events,
    say: rest ? [chapterLine(rest)] : [],
    data: {
      events: events.join(','),
      eventIndex: '0',
      todos: todosOf(chosen),
      todoIndex: '0',
      kept: '',
    },
    next: 'eventRoll',
  }
}

/**
 * What the member missed, each subject told alone when picked
 * @type {Scenario}
 */

export const RECAP_SCENARIO: Scenario = {
  entries: { recap: 'open', chapter: 'alone' },
  steps: { open, pick, alone, settle, settleAnswer, menu, eventRoll, eventRemind, eventNext },
  preparing: (step, data) =>
    step === 'open'
      ? COPY.preparing
      : step === 'alone'
        ? RECAP_CHAPTER_PREPARING[data.chapter as RecapChapterName]
        : null,
}
