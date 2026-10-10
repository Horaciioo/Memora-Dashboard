/**
 * Years a birth date may fall in, latest first
 * @param {number} thisYear - Current year
 * @param {number} minAge - Youngest age
 * @param {number} maxAge - Oldest age
 * @return {number[]} - Years
 */

export const birthYears = (thisYear: number, minAge: number, maxAge: number): number[] =>
  Array.from({ length: maxAge - minAge + 1 }, (_, index) => thisYear - minAge - index)

/**
 * Days of a month, a leap year while the year is unknown
 * @param {number | null} year - Year
 * @param {number} month - Month from 1
 * @return {number} - Day count
 */

export const daysInMonth = (year: number | null, month: number): number =>
  new Date(year ?? 2000, month, 0).getDate()

/**
 * ISO day of a birth date, empty until every part is chosen
 * @param {Object} parts - Chosen parts
 * @param {number | null} parts.year - Year
 * @param {number | null} parts.month - Month from 1
 * @param {number | null} parts.day - Day
 * @return {string} - ISO day or ''
 */

export const toBirthday = (parts: {
  year: number | null
  month: number | null
  day: number | null
}): string => {
  const { year, month, day } = parts
  if (year === null || month === null || day === null) return ''

  // A shorter month pulls the day back
  const clamped = Math.min(day, daysInMonth(year, month))

  return [year, month, clamped].map((part) => String(part).padStart(2, '0')).join('-')
}
