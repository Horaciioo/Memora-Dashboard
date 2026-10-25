import { invalidInput } from '@/core/lib/errors'

/**
 * Field of a raw body
 * @param {Record<string, unknown>} raw - Body
 * @param {string} field - Field name
 * @param {string} message - Failure message
 * @return {string} - Trimmed text
 */

export const readBodyText = (
  raw: Record<string, unknown>,
  field: string,
  message: string
): string => {
  const value = raw[field]
  if (typeof value !== 'string' || !value.trim()) throw invalidInput([{ field, message }], message)

  return value.trim()
}

/**
 * Optional integer of a raw body
 * @param {Record<string, unknown>} raw - Body
 * @param {string} field - Field name
 * @return {number | undefined} - Integer
 */

export const readBodyInteger = (
  raw: Record<string, unknown>,
  field: string
): number | undefined => {
  const value = raw[field]

  return typeof value === 'number' && Number.isInteger(value) ? value : undefined
}

/**
 * Optional string list of a raw body
 * @param {Record<string, unknown>} raw - Body
 * @param {string} field - Field name
 * @return {string[] | undefined} - Trimmed entries
 */

export const readBodyList = (raw: Record<string, unknown>, field: string): string[] | undefined => {
  const value = raw[field]
  if (!Array.isArray(value)) return undefined

  return value
    .filter((entry): entry is string => typeof entry === 'string')
    .map((entry) => entry.trim())
}

/**
 * Optional string map of a raw body
 * @param {Record<string, unknown>} raw - Body
 * @param {string} field - Field name
 * @return {Record<string, string>} - Entries
 */

export const readBodyMap = (
  raw: Record<string, unknown>,
  field: string
): Record<string, string> => {
  const value = raw[field]
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return {}

  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === 'string')
  )
}
