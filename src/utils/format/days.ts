import { DATE_LOCALE } from '@/declarations/ui/dates'

/**
 * Day arithmetic the calendar runs on, built on the native Date so no date
 * library ships to the browser. Every helper works in local time, because a
 * grid day is what the member sees, never what UTC says
 */

// Grids always start on Monday, matching the weekday labels
const WEEK_START = 1

// Days in a week, and the six weeks a month grid always draws
const WEEK_LENGTH = 7
const MONTH_GRID_LENGTH = 42

/**
 * Pad a number to two digits
 * @param {number} value - Number to pad
 * @return {string} - Padded number
 */

const pad = (value: number): string => String(value).padStart(2, '0')

/**
 * Read a day key or a moment as a local date
 * @param {Date | string} value - Day key, ISO moment or date
 * @return {Date} - Local date
 */

export const parseDay = (value: Date | string): Date => {
  if (value instanceof Date) return new Date(value.getTime())

  // A bare day key is local midnight, never UTC midnight
  const dayKey = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (dayKey) return new Date(Number(dayKey[1]), Number(dayKey[2]) - 1, Number(dayKey[3]))

  return new Date(value)
}

/**
 * Write a moment as its local day key
 * @param {Date | string} value - Moment to read
 * @return {string} - ISO day
 */

export const formatDayKey = (value: Date | string): string => {
  const date = parseDay(value)

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/**
 * Move a date by whole days
 * @param {Date} date - Starting date
 * @param {number} amount - Days to add, negative goes back
 * @return {Date} - Moved date
 */

export const addDays = (date: Date, amount: number): Date => {
  const moved = new Date(date.getTime())
  moved.setDate(moved.getDate() + amount)

  return moved
}

/**
 * Move a date by whole months, clamping onto the last day when the target is shorter
 * @param {Date} date - Starting date
 * @param {number} amount - Months to add, negative goes back
 * @return {Date} - Moved date
 */

export const addMonths = (date: Date, amount: number): Date => {
  const dayOfMonth = date.getDate()
  const moved = new Date(date.getTime())

  // Landing on the first avoids the overflow that turns 31 January into 3 March
  moved.setDate(1)
  moved.setMonth(moved.getMonth() + amount)

  const lastDay = new Date(moved.getFullYear(), moved.getMonth() + 1, 0).getDate()
  moved.setDate(Math.min(dayOfMonth, lastDay))

  return moved
}

/**
 * Read the first day of a month
 * @param {Date} date - Date inside the month
 * @return {Date} - First day
 */

export const startOfMonth = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), 1)

/**
 * Read the Monday opening the week a date sits in
 * @param {Date} date - Date inside the week
 * @return {Date} - Monday of that week
 */

export const startOfWeek = (date: Date): Date => {
  const weekday = date.getDay()

  // Sunday reads as 0, so it belongs to the week that started six days earlier
  const offset = (weekday - WEEK_START + WEEK_LENGTH) % WEEK_LENGTH

  return startOfDay(addDays(date, -offset))
}

/**
 * Read the first moment of a day
 * @param {Date} date - Day to read
 * @return {Date} - Midnight
 */

export const startOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate())

/**
 * Read the last moment of a day
 * @param {Date} date - Day to read
 * @return {Date} - Last millisecond
 */

export const endOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)

/**
 * Set the time of day, seconds and milliseconds cleared
 * @param {Date} date - Day to set
 * @param {number} hour - Hour of the day
 * @param {number} [minute] - Minute of the hour
 * @return {Date} - Moment on that day
 */

export const atTime = (date: Date, hour: number, minute = 0): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute, 0, 0)

/**
 * Tell whether two moments fall on the same local day
 * @param {Date} left - First moment
 * @param {Date} right - Second moment
 * @return {boolean} - Same day
 */

export const isSameDay = (left: Date, right: Date): boolean =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate()

/**
 * Count the days a grid draws for one month
 * @type {number}
 */

export const MONTH_GRID_DAYS = MONTH_GRID_LENGTH

/**
 * Count the days a grid draws for one week
 * @type {number}
 */

export const WEEK_GRID_DAYS = WEEK_LENGTH

/**
 * Name the month and year of a date
 * @param {Date} date - Date to name
 * @return {string} - Month and year
 */

export const monthLabel = (date: Date): string =>
  date.toLocaleDateString(DATE_LOCALE, { month: 'long', year: 'numeric' })

/**
 * Name the day and short month of a date
 * @param {Date} date - Date to name
 * @param {boolean} [withYear] - Append the year
 * @return {string} - Day and month
 */

export const dayMonthLabel = (date: Date, withYear = false): string =>
  date.toLocaleDateString(DATE_LOCALE, {
    day: 'numeric',
    month: 'short',
    ...(withYear ? { year: 'numeric' } : {}),
  })

/**
 * Read the time of a moment
 * @param {Date} date - Moment to read
 * @return {string} - Hours and minutes
 */

export const timeLabel = (date: Date): string => `${pad(date.getHours())}:${pad(date.getMinutes())}`
