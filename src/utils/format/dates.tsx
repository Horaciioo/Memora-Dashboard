import React, { ReactNode } from 'react'

import { DATE_COPY, DATE_LOCALE, MONTH_LABELS } from '@/declarations/ui/dates'
import { timeLabel } from '@/utils/format/days'

// Milliseconds in one day
const DAY_MS = 86_400_000

// Milliseconds in one minute and one hour, read by the elapsed wording
const MINUTE_MS = 60_000
const HOUR_MS = 3_600_000

/**
 * Format custom date
 * @param {string} dateString - Date string
 * @return {string} - Formatted date
 */

export function formatDateToCustomFormat(dateString: string): string {
  // Parse date
  const date = new Date(dateString)

  // Check if current year
  const currentYear = new Date().getFullYear()
  const year = date.getFullYear()
  const month = MONTH_LABELS[date.getMonth()]
  const day = date.getDate().toString()

  // Format based on year
  return year === currentYear ? `${day} ${month}` : `${day} ${month} ${year}`
}

/**
 * Format ISO date
 * @param {string} dateString - Date string
 * @return {string} - ISO string
 */

export function formatDateToISO(dateString: string): string {
  // Parse date
  const date = new Date(dateString)

  // Extract date parts
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')

  // Build ISO string
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
}

/**
 * Format date with timezone
 * @param {Date | string} date - Date object or string
 * @param {boolean} [utc] - Display UTC offset
 * @return {ReactNode} - Formatted JSX
 */

export function formatDate(date: Date | string, utc: boolean = true): ReactNode {
  // Format date and time
  const parsed = new Date(date)
  const formattedDate = parsed.toLocaleDateString(DATE_LOCALE, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  const formattedHour = timeLabel(parsed)

  // Get timezone offset
  const timezoneOffset = -parsed.getTimezoneOffset() / 60

  return (
    <>
      <span className="font-bold">{formattedDate}</span> {DATE_COPY.at}{' '}
      <span className="font-bold">{formattedHour}</span>{' '}
      {utc && `(UTC${timezoneOffset >= 0 ? '+' : ''}${timezoneOffset})`}
    </>
  )
}

/**
 * Format a day
 * @param {Date | string | null | undefined} date - Date to format
 * @return {string} - Day, or a dash when absent
 */

export function formatDay(date: Date | string | null | undefined): string {
  if (!date) return DATE_COPY.none

  return new Date(date).toLocaleDateString(DATE_LOCALE, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Format a day and its time
 * @param {Date | string | null | undefined} date - Date to format
 * @return {string} - Day and time, or a dash when absent
 */

export function formatDayTime(date: Date | string | null | undefined): string {
  if (!date) return DATE_COPY.none

  const parsed = new Date(date)

  return `${formatDay(parsed)} ${DATE_COPY.at} ${parsed.toLocaleTimeString(DATE_LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
  })}`
}

/**
 * Format a day range
 * @param {Date | string} start - First day
 * @param {Date | string} end - Last day
 * @return {string} - Range
 */

export function formatDayRange(start: Date | string, end: Date | string): string {
  return `${formatDay(start)} → ${formatDay(end)}`
}

/**
 * Count inclusive days between two dates
 * @param {Date | string} start - First day
 * @param {Date | string} end - Last day
 * @return {number} - Day count
 */

export function countDays(start: Date | string, end: Date | string): number {
  const from = new Date(start).setHours(0, 0, 0, 0)
  const to = new Date(end).setHours(0, 0, 0, 0)

  return Math.floor((to - from) / DAY_MS) + 1
}

/**
 * Describe a deadline against today
 * @param {Date | string | null | undefined} date - Deadline
 * @return {string} - Relative wording
 */

export function formatRelativeDay(date: Date | string | null | undefined): string {
  if (!date) return DATE_COPY.none

  const target = new Date(date).setHours(0, 0, 0, 0)
  const today = new Date().setHours(0, 0, 0, 0)
  const diff = Math.round((target - today) / DAY_MS)

  // Nearby days read better as words
  if (diff === 0) return DATE_COPY.today
  if (diff === 1) return DATE_COPY.tomorrow
  if (diff === -1) return DATE_COPY.yesterday

  return diff > 0
    ? DATE_COPY.inDays.replace('{count}', String(diff))
    : DATE_COPY.daysAgo.replace('{count}', String(-diff))
}

/**
 * Check a passed deadline
 * @param {Date | string | null | undefined} date - Deadline
 * @return {boolean} - Deadline is behind us
 */

export function isOverdue(date: Date | string | null | undefined): boolean {
  if (!date) return false

  return new Date(date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)
}

/**
 * Format a day for a date input
 * @param {Date | string | null | undefined} date - Date to format
 * @return {string} - ISO day, or an empty string
 */

export function toDateInput(date: Date | string | null | undefined): string {
  if (!date) return ''

  return new Date(date).toISOString().slice(0, 10)
}

/**
 * Format a moment for a datetime input
 * @param {Date | string | null | undefined} date - Date to format
 * @return {string} - ISO minute, or an empty string
 */

export function toDateTimeInput(date: Date | string | null | undefined): string {
  if (!date) return ''

  const parsed = new Date(date)
  const offset = parsed.getTimezoneOffset() * 60_000

  return new Date(parsed.getTime() - offset).toISOString().slice(0, 16)
}

/**
 * Describe how long ago a moment passed
 * @param {Date | string} date - Past moment
 * @return {string} - Elapsed wording
 */

export function formatSince(date: Date | string): string {
  const elapsed = Date.now() - new Date(date).getTime()

  // Anything under a minute reads as immediate
  if (elapsed < MINUTE_MS) return DATE_COPY.justNow
  if (elapsed < HOUR_MS) {
    return DATE_COPY.minutesAgo.replace('{count}', String(Math.floor(elapsed / MINUTE_MS)))
  }
  if (elapsed < DAY_MS) {
    return DATE_COPY.hoursAgo.replace('{count}', String(Math.floor(elapsed / HOUR_MS)))
  }

  return DATE_COPY.daysAgo.replace('{count}', String(Math.floor(elapsed / DAY_MS)))
}
