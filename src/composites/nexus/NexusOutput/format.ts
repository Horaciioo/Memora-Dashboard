import { DATE_LOCALE, DEFAULT_ZONE } from '@/declarations/ui/dates'

// ISO date and time
const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/

/**
 * Text of a value, null when empty
 * @param {unknown} value - Any value
 * @param {string} zone - Time zone
 * @return {string | null} - Text or null for an empty value
 */

export const formatValue = (value: unknown, zone: string = DEFAULT_ZONE): string | null => {
  if (value === null || value === undefined || value === '') return null
  if (typeof value === 'string' && ISO_DATE.test(value)) {
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString(DATE_LOCALE, { timeZone: zone, dateStyle: 'short', timeStyle: 'medium' })
    }
  }
  if (typeof value === 'object') return JSON.stringify(value)

  return String(value)
}

/**
 * Pretty text of a result for the clipboard
 * @param {unknown} value - Result value
 * @return {string} - Text or JSON
 */

export const copyText = (value: unknown): string =>
  typeof value === 'string' ? value : JSON.stringify(value, null, 2)

/**
 * Value as an object, empty when it is not one
 * @param {unknown} value - Any value
 * @return {Record<string, unknown>} - Object
 */

export const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

/**
 * Value as rows, objects only
 * @param {unknown} value - Any value
 * @return {Record<string, unknown>[]} - Rows
 */

export const asRows = (value: unknown): Record<string, unknown>[] =>
  Array.isArray(value) ? value.map((row) => (row && typeof row === 'object' ? asRecord(row) : { valeur: row })) : []
