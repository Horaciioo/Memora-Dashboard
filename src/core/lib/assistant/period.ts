import { addDays, dayOfMonth, readAt, readNumber } from '@/core/lib/assistant/dates'
import { tokenize } from '@/core/lib/assistant/normalize'
import type { AssistantToken } from '@/core/lib/assistant/normalize'
import { ASSISTANT_MONTHS, ASSISTANT_PERIOD_UNITS } from '@/declarations/assistant/lexicon'

/**
 * Days of a period read in a sentence
 * @typedef {Object} PeriodMatch
 * @property {string} start - First ISO day
 * @property {string} end - Last ISO day
 */

export interface PeriodMatch {
  start: string
  end: string
}

// A date as typed, before it is anchored
interface Mention {
  index: number
  width: number
  iso: string | null
  day: number | null
  month: number | null
}

// Words that lead a bare day number
const DAY_LEADS = new Set(['du', 'au', 'le', 'jusqu', 'et', 'entre'])

const DAY_MS = 86_400_000

// Written day number
const isDay = (word: string | undefined): word is string => Boolean(word && /^\d{1,2}$/.test(word))

/**
 * Days between two ISO days, both counted
 * @param {string} start - First ISO day
 * @param {string} end - Last ISO day
 * @return {number} - Day count
 */

export const spanDays = (start: string, end: string): number =>
  Math.round((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / DAY_MS) + 1

/**
 * Dates of a sentence in the order written
 * @param {AssistantToken[]} tokens - Sentence words
 * @param {string} today - ISO day
 * @return {Mention[]} - Dates found
 */

const scanDates = (tokens: AssistantToken[], today: string): Mention[] => {
  const found: Mention[] = []

  for (let index = 0; index < tokens.length; index += 1) {
    const word = tokens[index].folded
    const next = tokens[index + 1]?.folded
    const month = next ? ASSISTANT_MONTHS[next] : undefined

    // Day then month name
    if (isDay(word) && month) {
      found.push({ index, width: 2, iso: null, day: Number(word), month })
      index += 1
      continue
    }

    // "le 12" waits for its number
    if (word === 'le' && isDay(next)) continue

    if (isDay(word) && DAY_LEADS.has(tokens[index - 1]?.folded ?? '')) {
      found.push({ index, width: 1, iso: null, day: Number(word), month: null })
      continue
    }

    const match = readAt(tokens, index, today)
    if (!match) continue

    found.push({ index, width: match.indices.length, iso: match.value, day: null, month: null })
    index += match.indices.length - 1
  }

  return found
}

/**
 * Length asked in days
 * @param {AssistantToken[]} tokens - Sentence words
 * @return {number | null} - Days, or nothing
 */

const readLength = (tokens: AssistantToken[]): number | null => {
  for (let index = 0; index < tokens.length - 1; index += 1) {
    const amount = readNumber(tokens[index].folded)
    const unit = ASSISTANT_PERIOD_UNITS[tokens[index + 1].folded]

    // "dans 3 jours" is a date, not a length
    if (amount && unit && tokens[index - 1]?.folded !== 'dans') return amount * unit
  }

  return null
}

/**
 * Anchor a date on a base day
 * @param {Mention} mention - Date as typed
 * @param {string} base - Earliest ISO day
 * @param {number | undefined} fallbackMonth - Month a bare day borrows
 * @param {AssistantToken[]} tokens - Sentence words
 * @return {string | null} - ISO day
 */

const anchor = (
  mention: Mention,
  base: string,
  fallbackMonth: number | undefined,
  tokens: AssistantToken[]
): string | null => {
  if (mention.day) return dayOfMonth(base, mention.day, mention.month ?? fallbackMonth)
  if (mention.iso && mention.iso >= base) return mention.iso

  // A weekday earlier than the first date is the next one after it
  return readAt(tokens, mention.index, base)?.value ?? null
}

/**
 * Read a period in a sentence
 * @param {string} text - Raw sentence
 * @param {string} today - ISO day
 * @return {PeriodMatch | null} - Days, or nothing readable
 */

export const readPeriod = (text: string, today: string): PeriodMatch | null => {
  const tokens = tokenize(text)
  const mentions = scanDates(tokens, today)
  const length = readLength(tokens)
  const monthAfter = mentions.find((mention) => mention.month)?.month ?? undefined

  const first = mentions[0] ? anchor(mentions[0], today, monthAfter, tokens) : null
  if (mentions[0] && !first) return null

  const second = mentions[1] && first ? anchor(mentions[1], first, monthAfter, tokens) : null
  if (first && second) return { start: first, end: second }

  if (first && length) return { start: first, end: addDays(first, length - 1) }

  // Until a date counts from today
  const isUntil =
    mentions[0] && tokens.slice(0, mentions[0].index).some((t) => t.folded === 'jusqu')
  if (first && isUntil) return { start: today, end: first }
  if (first) return { start: first, end: first }
  if (length) return { start: today, end: addDays(today, length - 1) }

  return null
}
