// Weekdays offered by default, Monday to Saturday
const OPEN_WEEKDAYS = [1, 2, 3, 4, 5, 6]

/**
 * Minutes since midnight of a wall clock
 * @param {string} time - Wall clock, HH:MM
 * @return {number} - Minutes
 */

export const minutesOf = (time: string): number => {
  const [hours = '0', minutes = '0'] = time.split(':')

  return Number(hours) * 60 + Number(minutes)
}

/**
 * Wall clock of a minute count
 * @param {number} minutes - Minutes since midnight
 * @return {string} - HH:MM
 */

export const clockOf = (minutes: number): string =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`

/**
 * Slot starts of one day, every step from the opening to the last slot that still ends in time
 * @param {string} from - Opening wall clock
 * @param {string} to - Closing wall clock
 * @param {number} step - Slot length in minutes
 * @return {string[]} - Wall clocks of the slot starts
 */

export const slotClocks = (from: string, to: string, step: number): string[] => {
  const slots: string[] = []

  for (let minute = minutesOf(from); minute + step <= minutesOf(to); minute += step) {
    slots.push(clockOf(minute))
  }

  return slots
}

/**
 * Days of a range that a period opens on
 * @param {string} fromDay - First ISO day
 * @param {string} toDay - Last ISO day
 * @param {number[]} [weekdays] - Weekdays kept, 1 for Monday
 * @return {string[]} - ISO days
 */

export const openDays = (
  fromDay: string,
  toDay: string,
  weekdays: number[] = OPEN_WEEKDAYS
): string[] => {
  const days: string[] = []
  const cursor = new Date(`${fromDay}T12:00:00Z`)
  const end = new Date(`${toDay}T12:00:00Z`)

  while (cursor <= end && days.length < 366) {
    const weekday = ((cursor.getUTCDay() + 6) % 7) + 1
    if (weekdays.includes(weekday)) days.push(cursor.toISOString().slice(0, 10))
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }

  return days
}
