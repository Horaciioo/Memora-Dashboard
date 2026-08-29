import moment from 'moment'

import { DATE_LOCALE } from '@/declarations/ui/dates'

/**
 * One day of a rendered grid
 * @typedef {Object} CalendarDay
 * @property {string} key - ISO day, the drop container identifier
 * @property {number} dayOfMonth - Number shown in the corner
 * @property {boolean} isCurrentMonth - Belongs to the month on screen
 * @property {boolean} isToday - Is the current day
 */

export interface CalendarDay {
  key: string
  dayOfMonth: number
  isCurrentMonth: boolean
  isToday: boolean
}

// Grids always start on Monday, matching the weekday labels
const WEEK_START = 1

/**
 * Read the ISO day of a moment
 * @param {Date | string} date - Moment to read
 * @return {string} - ISO day
 */

export const toDayKey = (date: Date | string): string => moment(date).format('YYYY-MM-DD')

/**
 * Build the six week grid of one month
 * @param {string} anchor - ISO day inside the month
 * @return {CalendarDay[]} - Days in display order
 */

export const monthGrid = (anchor: string): CalendarDay[] => {
  const month = moment(anchor)
  const cursor = month.clone().startOf('month').isoWeekday(WEEK_START)

  // A month never spans more than six weeks, so the grid is always the same height
  return Array.from({ length: 42 }, (_, index) => {
    const day = cursor.clone().add(index, 'days')

    return {
      key: day.format('YYYY-MM-DD'),
      dayOfMonth: day.date(),
      isCurrentMonth: day.month() === month.month(),
      isToday: day.isSame(moment(), 'day'),
    }
  })
}

/**
 * Build the seven days of one week
 * @param {string} anchor - ISO day inside the week
 * @return {CalendarDay[]} - Days in display order
 */

export const weekGrid = (anchor: string): CalendarDay[] => {
  const start = moment(anchor).isoWeekday(WEEK_START)

  return Array.from({ length: 7 }, (_, index) => {
    const day = start.clone().add(index, 'days')

    return {
      key: day.format('YYYY-MM-DD'),
      dayOfMonth: day.date(),
      isCurrentMonth: true,
      isToday: day.isSame(moment(), 'day'),
    }
  })
}

/**
 * Read the window a grid covers, so the server only sends what is shown
 * @param {CalendarDay[]} days - Rendered days
 * @return {{ from: string, to: string }} - ISO bounds
 */

export const gridRange = (days: CalendarDay[]): { from: string; to: string } => ({
  from: moment(days[0].key).startOf('day').toISOString(),
  to: moment(days[days.length - 1].key)
    .endOf('day')
    .toISOString(),
})

/**
 * Shift an anchor by one period
 * @param {string} anchor - ISO day on screen
 * @param {'month' | 'week'} unit - Period being browsed
 * @param {number} amount - Steps to move, negative goes back
 * @return {string} - New ISO day
 */

export const shiftAnchor = (anchor: string, unit: 'month' | 'week', amount: number): string =>
  moment(anchor).add(amount, unit).format('YYYY-MM-DD')

/**
 * Title of the period on screen
 * @param {string} anchor - ISO day on screen
 * @param {'month' | 'week'} unit - Period being browsed
 * @return {string} - Display title
 */

export const periodLabel = (anchor: string, unit: 'month' | 'week'): string => {
  const day = moment(anchor).locale(DATE_LOCALE)

  if (unit === 'month') return day.format('MMMM YYYY')

  const start = day.clone().isoWeekday(WEEK_START)

  return `${start.format('D MMM')} – ${start.clone().add(6, 'days').format('D MMM YYYY')}`
}

/**
 * Move a moment onto another day, keeping its time of day
 * @param {string} startsAt - ISO moment being moved
 * @param {string} dayKey - ISO day it lands on
 * @return {Date} - New moment
 */

export const moveToDay = (startsAt: string, dayKey: string): Date => {
  const source = moment(startsAt)
  const target = moment(dayKey)

  return target.hour(source.hour()).minute(source.minute()).second(0).millisecond(0).toDate()
}

/**
 * Move a moment onto another day and hour
 * @param {string} dayKey - ISO day it lands on
 * @param {number} hour - Hour it lands on
 * @return {Date} - New moment
 */

export const moveToSlot = (dayKey: string, hour: number): Date =>
  moment(dayKey).hour(hour).minute(0).second(0).millisecond(0).toDate()

/**
 * Read the hour of a moment
 * @param {string} date - ISO moment
 * @return {number} - Hour of the day
 */

export const hourOf = (date: string): number => moment(date).hour()

/**
 * Read the time of a moment
 * @param {string} date - ISO moment
 * @return {string} - Hours and minutes
 */

export const timeOf = (date: string): string => moment(date).format('HH:mm')

/**
 * Tell whether an entry is still running on one day
 * @param {string} startsAt - ISO first moment
 * @param {string | null} endsAt - ISO last moment
 * @param {string} dayKey - ISO day
 * @return {boolean} - Covers the day
 */

export const coversDay = (startsAt: string, endsAt: string | null, dayKey: string): boolean => {
  const day = moment(dayKey)

  return (
    day.isSameOrAfter(moment(startsAt), 'day') &&
    day.isSameOrBefore(moment(endsAt ?? startsAt), 'day')
  )
}

/**
 * Read the last day an entry runs on
 * @param {string} startsAt - ISO first moment
 * @param {string | null} endsAt - ISO last moment
 * @return {string} - ISO day
 */

export const lastDayKey = (startsAt: string, endsAt: string | null): string =>
  moment(endsAt ?? startsAt).format('YYYY-MM-DD')

/**
 * Read the moment one slot ends on
 * @param {string} dayKey - ISO day
 * @param {number} hour - Hour of the day
 * @return {Date} - End of the slot
 */

export const slotEnd = (dayKey: string, hour: number): Date =>
  moment(dayKey)
    .hour(hour + 1)
    .minute(0)
    .second(0)
    .millisecond(0)
    .toDate()

/**
 * Read the whole day as a moment pair
 * @param {string} dayKey - ISO day
 * @param {number} startHour - First hour drawn
 * @param {number} endHour - Last hour drawn
 * @return {{ startsAt: Date, endsAt: Date }} - Day bounds
 */

export const dayBounds = (
  dayKey: string,
  startHour: number,
  endHour: number
): { startsAt: Date; endsAt: Date } => ({
  startsAt: moment(dayKey).hour(startHour).startOf('hour').toDate(),
  endsAt: moment(dayKey).hour(endHour).endOf('hour').toDate(),
})

/**
 * Order two grid keys, a slide being just as valid backwards
 * @param {string} first - Key the pointer went down on
 * @param {string} second - Key the pointer stopped on
 * @return {[string, string]} - Keys in reading order
 */

export const orderKeys = (first: string, second: string): [string, string] =>
  first <= second ? [first, second] : [second, first]

/**
 * Turn a moment into the value a datetime field reads
 * @param {Date} date - Moment to write
 * @return {string} - Field value
 */

export const toFieldValue = (date: Date): string => moment(date).format('YYYY-MM-DDTHH:mm')
