import {
  MONTH_GRID_DAYS,
  WEEK_GRID_DAYS,
  addDays,
  addMonths,
  atTime,
  dayMonthLabel,
  endOfDay,
  formatDayKey,
  isSameDay,
  monthLabel,
  parseDay,
  startOfDay,
  startOfMonth,
  startOfWeek,
  timeLabel,
} from '@/utils/format/days'

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

/**
 * Read the ISO day of a moment
 * @param {Date | string} date - Moment to read
 * @return {string} - ISO day
 */

export const toDayKey = (date: Date | string): string => formatDayKey(date)

/**
 * Build one day of a grid
 * @param {Date} day - Day being drawn
 * @param {number} currentMonth - Month on screen
 * @param {Date} today - Current day
 * @return {CalendarDay} - Grid day
 */

const toCalendarDay = (day: Date, currentMonth: number, today: Date): CalendarDay => ({
  key: formatDayKey(day),
  dayOfMonth: day.getDate(),
  isCurrentMonth: day.getMonth() === currentMonth,
  isToday: isSameDay(day, today),
})

/**
 * Build the six week grid of one month
 * @param {string} anchor - ISO day inside the month
 * @return {CalendarDay[]} - Days in display order
 */

export const monthGrid = (anchor: string): CalendarDay[] => {
  const month = parseDay(anchor)
  const cursor = startOfWeek(startOfMonth(month))
  const today = new Date()

  // A month never spans more than six weeks, so the grid is always the same height
  return Array.from({ length: MONTH_GRID_DAYS }, (_, index) =>
    toCalendarDay(addDays(cursor, index), month.getMonth(), today)
  )
}

/**
 * Build the seven days of one week
 * @param {string} anchor - ISO day inside the week
 * @return {CalendarDay[]} - Days in display order
 */

export const weekGrid = (anchor: string): CalendarDay[] => {
  const start = startOfWeek(parseDay(anchor))
  const today = new Date()

  return Array.from({ length: WEEK_GRID_DAYS }, (_, index) => {
    const day = addDays(start, index)

    return { ...toCalendarDay(day, day.getMonth(), today), isCurrentMonth: true }
  })
}

/**
 * Read the window a grid covers, so the server only sends what is shown
 * @param {CalendarDay[]} days - Rendered days
 * @return {{ from: string, to: string }} - ISO bounds
 */

export const gridRange = (days: CalendarDay[]): { from: string; to: string } => ({
  from: startOfDay(parseDay(days[0].key)).toISOString(),
  to: endOfDay(parseDay(days[days.length - 1].key)).toISOString(),
})

/**
 * Shift an anchor by one period
 * @param {string} anchor - ISO day on screen
 * @param {'month' | 'week'} unit - Period being browsed
 * @param {number} amount - Steps to move, negative goes back
 * @return {string} - New ISO day
 */

export const shiftAnchor = (anchor: string, unit: 'month' | 'week', amount: number): string => {
  const day = parseDay(anchor)

  return formatDayKey(
    unit === 'month' ? addMonths(day, amount) : addDays(day, amount * WEEK_GRID_DAYS)
  )
}

/**
 * Title of the period on screen
 * @param {string} anchor - ISO day on screen
 * @param {'month' | 'week'} unit - Period being browsed
 * @return {string} - Display title
 */

export const periodLabel = (anchor: string, unit: 'month' | 'week'): string => {
  const day = parseDay(anchor)

  if (unit === 'month') return monthLabel(day)

  const start = startOfWeek(day)

  return `${dayMonthLabel(start)} – ${dayMonthLabel(addDays(start, WEEK_GRID_DAYS - 1), true)}`
}

/**
 * Move a moment onto another day, keeping its time of day
 * @param {string} startsAt - ISO moment being moved
 * @param {string} dayKey - ISO day it lands on
 * @return {Date} - New moment
 */

export const moveToDay = (startsAt: string, dayKey: string): Date => {
  const source = parseDay(startsAt)

  return atTime(parseDay(dayKey), source.getHours(), source.getMinutes())
}

/**
 * Move a moment onto another day and hour
 * @param {string} dayKey - ISO day it lands on
 * @param {number} hour - Hour it lands on
 * @return {Date} - New moment
 */

export const moveToSlot = (dayKey: string, hour: number): Date => atTime(parseDay(dayKey), hour)

/**
 * Read the hour of a moment
 * @param {string} date - ISO moment
 * @return {number} - Hour of the day
 */

export const hourOf = (date: string): number => parseDay(date).getHours()

/**
 * Read the time of a moment
 * @param {string} date - ISO moment
 * @return {string} - Hours and minutes
 */

export const timeOf = (date: string): string => timeLabel(parseDay(date))

/**
 * Tell whether an entry is still running on one day
 * @param {string} startsAt - ISO first moment
 * @param {string | null} endsAt - ISO last moment
 * @param {string} dayKey - ISO day
 * @return {boolean} - Covers the day
 */

export const coversDay = (startsAt: string, endsAt: string | null, dayKey: string): boolean => {
  const day = startOfDay(parseDay(dayKey)).getTime()

  return (
    day >= startOfDay(parseDay(startsAt)).getTime() &&
    day <= startOfDay(parseDay(endsAt ?? startsAt)).getTime()
  )
}

/**
 * Read the last day an entry runs on
 * @param {string} startsAt - ISO first moment
 * @param {string | null} endsAt - ISO last moment
 * @return {string} - ISO day
 */

export const lastDayKey = (startsAt: string, endsAt: string | null): string =>
  formatDayKey(endsAt ?? startsAt)

/**
 * Read the moment one slot ends on
 * @param {string} dayKey - ISO day
 * @param {number} hour - Hour of the day
 * @return {Date} - End of the slot
 */

export const slotEnd = (dayKey: string, hour: number): Date => atTime(parseDay(dayKey), hour + 1)

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
): { startsAt: Date; endsAt: Date } => {
  const day = parseDay(dayKey)

  return {
    startsAt: atTime(day, startHour),
    endsAt: new Date(atTime(day, endHour).getTime() + 3_599_999),
  }
}

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

export const toFieldValue = (date: Date): string => `${formatDayKey(date)}T${timeLabel(date)}`
