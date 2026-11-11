import { apiDelete } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { failure } from '@/core/lib/assistant/scenarios/failure'
import { announcedLives, platformName, whenOf } from '@/core/lib/assistant/scenarios/live/shared'
import { LIVE_SCENARIO_COPY as COPY } from '@/declarations/assistant/scenarios/live'
import { SCENARIO_COPY } from '@/declarations/assistant/scenarios/shared'
import type { ScenarioStep } from '@/types/scenario'
import { capitalizeFirstLetter, fillTemplate } from '@/utils/format/strings'

/**
 * Find which live to remove
 * @return {Promise<ScenarioMove>} - Lives to pick, or none
 */

export const deletePick: ScenarioStep = async () => {
  const lives = await announcedLives()
  if (lives.length === 0) return { say: [COPY.removeNone] }

  return {
    say: [COPY.removeWhich],
    ask: {
      kind: 'choices',
      choices: lives.map((live) => ({
        value: live.id,
        label: `${live.youtuber.name}, ${platformName(live.platform)}`,
        hint: capitalizeFirstLetter(whenOf(live.plannedStartAt)),
      })),
    },
    next: 'deleteConfirm',
  }
}

/**
 * A removal is never silent
 * @param {ScenarioContext} context - Member and data
 * @param {ScenarioAnswer | null} answer - Live identifier
 * @return {Promise<ScenarioMove>} - Move asking to confirm
 */

export const deleteConfirm: ScenarioStep = async (context, answer) => {
  const live = (await announcedLives()).find((entry) => entry.id === answer?.value)
  if (!live) return { say: [SCENARIO_COPY.notUnderstood] }

  return {
    say: [
      fillTemplate(COPY.removeSure, {
        platform: platformName(live.platform),
        creator: live.youtuber.name,
        when: whenOf(live.plannedStartAt),
      }),
    ],
    ask: {
      kind: 'choices',
      choices: [
        { value: 'yes', label: COPY.removeYes, tone: 'danger' },
        { value: 'no', label: COPY.removeKeep },
      ],
    },
    next: 'deleteAnswer',
    data: { entryId: live.calendarEventId ?? '' },
  }
}

export const deleteAnswer: ScenarioStep = async (context, answer) =>
  answer?.value === 'yes'
    ? { say: [], next: 'deleteRun', thinking: true }
    : { say: [COPY.removeKept] }

/**
 * Remove the calendar entry, its live goes with it
 * @param {ScenarioContext} context - Member and data
 * @return {Promise<ScenarioMove>} - Done, or why not
 */

export const deleteRun: ScenarioStep = async (context) => {
  try {
    await apiDelete<{ ids: string[] }>(API_ROUTES.calendarEntries, { ids: [context.data.entryId] })
  } catch (error) {
    return failure(error)
  }

  context.refresh()

  return { say: [COPY.removeDone] }
}
