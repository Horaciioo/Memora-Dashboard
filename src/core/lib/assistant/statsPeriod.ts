import { addDays, readNumber } from '@/core/lib/assistant/dates'
import { findRun } from '@/core/lib/assistant/intents'
import type { AssistantToken } from '@/core/lib/assistant/normalize'
import { STATS_LAST_WORDS, STATS_PERIODS } from '@/declarations/assistant/lexicon/stats'
import { ASSISTANT_SETTINGS } from '@/declarations/assistant/settings'
import type { PeriodMatch } from '@/core/lib/assistant/period'

/**
 * Window a figure is told over, and the one before it
 * @typedef {Object} StatsWindow
 * @property {string} start - First ISO day
 * @property {string} end - Last ISO day
 * @property {string} label - How Memora says it
 * @property {PeriodMatch} before - Window of the same length that ends the day before
 */

export interface StatsWindow extends PeriodMatch {
  label: string
  before: PeriodMatch
}

// Weekday of an ISO day, Monday is 0
const weekdayOf = (day: string): number => (new Date(`${day}T00:00:00Z`).getUTCDay() + 6) % 7

// Days between two ISO days, both counted
const lengthOf = (start: string, end: string): number =>
  Math.round((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86_400_000) + 1

// First day of the month of a day
const monthStart = (day: string): string => `${day.slice(0, 7)}-01`

/**
 * Window with the one before it
 * @param {string} start - First ISO day
 * @param {string} end - Last ISO day
 * @param {string} label - How Memora says it
 * @return {StatsWindow} - Both windows
 */

const windowOf = (start: string, end: string, label: string): StatsWindow => {
  const length = lengthOf(start, end)

  return { start, end, label, before: { start: addDays(start, -length), end: addDays(start, -1) } }
}

/**
 * Number of days of « les 30 derniers jours »
 * @param {AssistantToken[]} tokens - Sentence words
 * @return {number | null} - Days, or nothing
 */

const readLastDays = (tokens: AssistantToken[]): number | null => {
  for (let index = 1; index < tokens.length - 1; index += 1) {
    const isLast = (STATS_LAST_WORDS.last as readonly string[]).includes(tokens[index].folded)
    const isDays = (STATS_LAST_WORDS.days as readonly string[]).includes(tokens[index + 1].folded)
    const amount = readNumber(tokens[index - 1].folded)
    if (isLast && isDays && amount) return amount
  }

  return null
}

/**
 * Read the window a figure is asked over, this month when nothing is said
 * @param {AssistantToken[]} tokens - Sentence words
 * @param {string} today - ISO day
 * @return {StatsWindow} - Window and the one before it
 */

export const readStatsWindow = (tokens: AssistantToken[], today: string): StatsWindow => {
  const days = readLastDays(tokens)
  if (days) {
    const length = Math.min(days, ASSISTANT_SETTINGS.statsMaxDays)

    return windowOf(addDays(today, 1 - length), today, `les ${length} derniers jours`)
  }

  const named = STATS_PERIODS.find((period) =>
    period.phrases.some((phrase) => findRun(tokens, phrase))
  )
  const label = named?.label ?? STATS_PERIODS.find((period) => period.id === 'thisMonth')!.label
  const weekStart = addDays(today, -weekdayOf(today))
  const previousMonthEnd = addDays(monthStart(today), -1)

  switch (named?.id) {
    case 'today':
      return windowOf(today, today, label)
    case 'yesterday':
      return windowOf(addDays(today, -1), addDays(today, -1), label)
    case 'thisWeek':
      return windowOf(weekStart, today, label)
    case 'lastWeek':
      return windowOf(addDays(weekStart, -7), addDays(weekStart, -1), label)
    case 'lastMonth':
      return windowOf(monthStart(previousMonthEnd), previousMonthEnd, label)
    case 'thisYear':
      return windowOf(`${today.slice(0, 4)}-01-01`, today, label)
    default:
      return windowOf(monthStart(today), today, label)
  }
}
