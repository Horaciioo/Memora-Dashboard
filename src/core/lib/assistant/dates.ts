import type { AssistantToken } from '@/core/lib/assistant/normalize'
import {
  ASSISTANT_DAY_OFFSETS,
  ASSISTANT_DAY_UNITS,
  ASSISTANT_NUMBERS,
  ASSISTANT_WEEKDAYS,
} from '@/declarations/assistant/lexicon'

/**
 * Date read in a sentence
 * @typedef {Object} DueMatch
 * @property {string} value - ISO day
 * @property {number[]} indices - Words used
 */

export interface DueMatch {
  value: string
  indices: number[]
}

const DAY_MS = 86_400_000

// Words that only lead a date
const LEADS = new Set(['pour', 'avant', 'le', 'd', 'ici', 'jusqu', 'au'])

/**
 * Shift an ISO day
 * @param {string} today - ISO day
 * @param {number} days - Offset
 * @return {string} - ISO day
 */

export const addDays = (today: string, days: number): string =>
  new Date(Date.parse(`${today}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10)

// Weekday of an ISO day
const weekdayOf = (day: string): number => new Date(`${day}T00:00:00Z`).getUTCDay()

/**
 * Next given weekday
 * @param {string} today - ISO day
 * @param {number} weekday - Sunday is 0
 * @return {string} - ISO day
 */

const nextWeekday = (today: string, weekday: number): string =>
  addDays(today, (weekday - weekdayOf(today) + 7) % 7 || 7)

/**
 * Day of the month
 * @param {string} today - ISO day
 * @param {number} day - Day number
 * @param {number} [month] - Month number
 * @return {string | null} - Next such day
 */

export const dayOfMonth = (today: string, day: number, month?: number): string | null => {
  const [year, current] = today.split('-').map(Number)
  const pick = (y: number, m: number) => {
    const date = new Date(Date.UTC(y, m - 1, day))

    return date.getUTCDate() === day ? date.toISOString().slice(0, 10) : null
  }

  // A passed date rolls forward
  const first = pick(year, month ?? current)
  if (first && first >= today) return first

  return month ? pick(year + 1, month) : pick(year, current + 1)
}

// Numeric day like 12/11
const readSlashed = (token: string, today: string): string | null => {
  const [day, month, year] = token.split('/').map(Number)
  if (!month) return null

  if (!year) return dayOfMonth(today, day, month)

  const date = new Date(Date.UTC(year < 100 ? 2000 + year : year, month - 1, day))

  return date.getUTCDate() === day ? date.toISOString().slice(0, 10) : null
}

// Number written or spelled
export const readNumber = (word: string | undefined): number | null => {
  if (!word) return null
  if (/^\d+$/.test(word)) return Number(word)

  return ASSISTANT_NUMBERS[word] ?? null
}

/**
 * Read one date at a word
 * @param {AssistantToken[]} tokens - Sentence words
 * @param {number} index - Word read
 * @param {string} today - ISO day
 * @return {DueMatch | null} - Date found
 */

export const readAt = (tokens: AssistantToken[], index: number, today: string): DueMatch | null => {
  const word = tokens[index].folded
  const next = tokens[index + 1]?.folded

  // Named offsets and weekdays
  if (word in ASSISTANT_DAY_OFFSETS) {
    return { value: addDays(today, ASSISTANT_DAY_OFFSETS[word]), indices: [index] }
  }
  const weekday = ASSISTANT_WEEKDAYS.indexOf(word as (typeof ASSISTANT_WEEKDAYS)[number])
  if (weekday >= 0) {
    const extra = next === 'prochain' ? [index + 1] : []
    return { value: nextWeekday(today, weekday), indices: [index, ...extra] }
  }

  // In some days or weeks
  const amount = readNumber(next)
  const unit = tokens[index + 2]?.folded
  if (word === 'dans' && amount && unit && unit in ASSISTANT_DAY_UNITS) {
    return {
      value: addDays(today, amount * ASSISTANT_DAY_UNITS[unit]),
      indices: [index, index + 1, index + 2],
    }
  }

  // Written days
  if (word.includes('/')) {
    const value = readSlashed(word, today)
    return value ? { value, indices: [index] } : null
  }
  const day = word === 'le' && next && /^\d{1,2}$/.test(next) ? Number(next) : null
  const value = day ? dayOfMonth(today, day) : null

  return value ? { value, indices: [index, index + 1] } : null
}

/**
 * Find a due date
 * @param {AssistantToken[]} tokens - Sentence words
 * @param {string} today - ISO day
 * @return {DueMatch | null} - First date
 */

export const extractDue = (tokens: AssistantToken[], today: string): DueMatch | null => {
  for (let index = 0; index < tokens.length; index += 1) {
    const match = readAt(tokens, index, today)
    if (!match) continue

    // Leading words go with the date
    let lead = match.indices[0] - 1
    while (lead >= 0 && LEADS.has(tokens[lead].folded) && match.indices[0] - lead <= 3) {
      match.indices.unshift(lead)
      lead -= 1
    }

    return match
  }

  return null
}
