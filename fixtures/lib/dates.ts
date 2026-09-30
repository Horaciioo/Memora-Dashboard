// Every date is read against the day the fixtures run, so the history always ends today
const DAY_MS = 86_400_000

export const TODAY = (() => {
  const day = new Date()
  day.setHours(0, 0, 0, 0)

  return day
})()

// How far back the story goes
export const HISTORY_DAYS = 180

/**
 * Day shifted from today
 * @param {number} days - Signed offset, negative in the past
 * @param {number} [hour] - Hour of the day
 * @param {number} [minute] - Minute of the hour
 * @return {Date} - Moment
 */

export const day = (days: number, hour = 0, minute = 0): Date => {
  const moment = new Date(TODAY.getTime() + days * DAY_MS)
  moment.setHours(hour, minute, 0, 0)

  return moment
}

/**
 * Moment shifted from another
 * @param {Date} from - Starting moment
 * @param {number} minutes - Signed offset
 * @return {Date} - Moment
 */

export const plusMinutes = (from: Date, minutes: number): Date =>
  new Date(from.getTime() + minutes * 60_000)

/**
 * Whole days between two moments
 * @param {Date} from - Start
 * @param {Date} to - End
 * @return {number} - Days, inclusive
 */

export const spanDays = (from: Date, to: Date): number =>
  Math.round((to.getTime() - from.getTime()) / DAY_MS) + 1
