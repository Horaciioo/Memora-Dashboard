import { extractDue } from '@/core/lib/assistant/dates'
import { tokenize } from '@/core/lib/assistant/normalize'

// An hour as typed: 20h, 20h30, 20:30
const HOUR = /(\d{1,2})\s*(?:h|:)\s*(\d{2})?/i

// A lone hour answering "À quelle heure ?"
const ALONE = /^\s*(\d{1,2})\s*(?:h|:)?\s*(\d{2})?\s*$/

/**
 * Wall clock of an hour
 * @param {string} hours - Hours typed
 * @param {string} [minutes] - Minutes typed
 * @return {string | null} - "HH:MM", or nothing when it is no hour
 */

const clockOf = (hours: string, minutes = '00'): string | null =>
  Number(hours) < 24 && Number(minutes) < 60 ? `${hours.padStart(2, '0')}:${minutes}` : null

/**
 * Day and hour read in a sentence
 * @param {string} text - Typed words
 * @param {string} today - ISO day
 * @return {{ day: string | null, time: string | null }} - Parts found
 */

export const readMoment = (
  text: string,
  today: string
): { day: string | null; time: string | null } => {
  const found = HOUR.exec(text)
  const time = found ? clockOf(found[1], found[2]) : null
  // The hour goes first, its digits would pass for a day of the month
  const rest = found ? text.replace(found[0], ' ') : text

  return { day: extractDue(tokenize(rest), today)?.value ?? null, time }
}

/**
 * Hour alone
 * @param {string} text - Typed words
 * @return {string | null} - "HH:MM", or nothing
 */

export const readTime = (text: string): string | null => {
  const found = ALONE.exec(text)

  return found ? clockOf(found[1], found[2]) : null
}
