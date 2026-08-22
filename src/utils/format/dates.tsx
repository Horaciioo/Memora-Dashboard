import moment from 'moment'
import React, { ReactNode } from 'react'

/**
 * Format custom date
 * @param {string} dateString - Date string
 * @return {string} - Formatted date
 */

export function formatDateToCustomFormat(dateString: string): string {
  // Month abbreviations
  const months = [
    'Jan.',
    'Feb.',
    'Mar.',
    'Apr.',
    'May',
    'Jun.',
    'Jul.',
    'Aug.',
    'Sep.',
    'Oct.',
    'Nov.',
    'Dec.',
  ]

  // Parse date
  const date = new Date(dateString)

  // Check if current year
  const currentYear = new Date().getFullYear()
  const year = date.getFullYear()
  const month = months[date.getMonth()]
  const day = date.getDate().toString()

  // Format based on year
  return year === currentYear ? `${month} ${day}` : `${month} ${day} ${year}`
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
  const formattedDate = moment(date).format('MM/DD/YYYY')
  const formattedHour = moment(date).format('HH:mm:ss')

  // Get timezone offset
  const timezoneOffset = moment(date).utcOffset() / 60

  return (
    <>
      <span className="font-bold">{formattedDate}</span> at{' '}
      <span className="font-bold">{formattedHour}</span>{' '}
      {utc && `(UTC${timezoneOffset >= 0 ? '+' : ''}${timezoneOffset})`}
    </>
  )
}
