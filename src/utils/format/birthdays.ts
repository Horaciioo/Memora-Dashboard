import { DATE_LOCALE } from '@/declarations/ui/dates'
import type { FieldOption } from '@/types/forms'
import { startOfDay } from '@/utils/format/time/days'

const DAY_MS = 86_400_000

// A birthday is a date without a time zone, read as stored
const DAY_OF_BIRTH = { timeZone: 'UTC' } as const

/**
 * Month of a birthday
 * @param {string} birthday - ISO date
 * @return {number} - Month, 0 for January
 */

export const birthdayMonth = (birthday: string): number => new Date(birthday).getUTCMonth()

/**
 * Days left before the next birthday
 * @param {string} birthday - ISO date
 * @param {Date} today - Day it is counted from
 * @return {number} - 0 on the day itself
 */

export const daysUntilBirthday = (birthday: string, today: Date): number => {
  const born = new Date(birthday)
  const from = startOfDay(today)
  let next = new Date(from.getFullYear(), born.getUTCMonth(), born.getUTCDate())

  if (next.getTime() < from.getTime()) {
    next = new Date(from.getFullYear() + 1, born.getUTCMonth(), born.getUTCDate())
  }

  return Math.round((next.getTime() - from.getTime()) / DAY_MS)
}

/**
 * Day and month of a birthday
 * @param {string} birthday - ISO date
 * @return {string} - Day and month spelled out
 */

export const formatBirthday = (birthday: string): string =>
  new Date(birthday).toLocaleDateString(DATE_LOCALE, {
    ...DAY_OF_BIRTH,
    day: 'numeric',
    month: 'long',
  })

/**
 * Months as filter options
 * @return {FieldOption[]} - Twelve months, valued by their index
 */

export const monthOptions = (): FieldOption[] =>
  Array.from({ length: 12 }, (_, month) => ({
    value: String(month),
    label: new Date(Date.UTC(2000, month, 1)).toLocaleDateString(DATE_LOCALE, {
      ...DAY_OF_BIRTH,
      month: 'long',
    }),
  }))
