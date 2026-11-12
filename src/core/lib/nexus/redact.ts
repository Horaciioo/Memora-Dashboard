import { ENCRYPTED_FIELDS } from '@/declarations/system/security/encryption'
import { SENSITIVE_FIELD_REGISTRY } from '@/declarations/access/sensitive'
import { NEXUS_COPY } from '@/declarations/nexus/copy'
import { NEXUS_MASKED_PATTERNS } from '@/declarations/nexus/settings'

// Sensitive registry keys
const SENSITIVE_NAMES = SENSITIVE_FIELD_REGISTRY.keys.map((key) => key.toLowerCase())

// Every fragment, lowercase
const PATTERNS = NEXUS_MASKED_PATTERNS.map((pattern) => pattern.toLowerCase())

/**
 * Column name never shown
 * @param {string} column - Column name
 * @param {string[]} [extra] - Entity specific columns
 * @return {boolean} - Value is masked
 */

export const isMaskedColumn = (column: string, extra: readonly string[] = []): boolean => {
  const name = column.toLowerCase()

  return (
    extra.includes(column) ||
    ENCRYPTED_FIELDS.includes(column) ||
    SENSITIVE_NAMES.includes(name) ||
    PATTERNS.some((pattern) => name.includes(pattern))
  )
}

/**
 * Replace one value
 * @param {unknown} value - Raw value
 * @return {unknown} - Safe value
 */

const redactValue = (value: unknown): unknown => {
  if (value instanceof Uint8Array) return `[${value.byteLength} octets]`
  if (typeof value === 'bigint') return value.toString()
  if (Array.isArray(value)) return value.map(redactValue)
  if (value instanceof Date || value === null || typeof value !== 'object') return value

  return redactRecord(value as Record<string, unknown>)
}

/**
 * Mask a row recursively
 * @param {Record<string, unknown>} row - Raw row
 * @param {string[]} [extra] - Entity specific columns
 * @return {Record<string, unknown>} - Safe row
 */

export const redactRecord = (
  row: Record<string, unknown>,
  extra: readonly string[] = []
): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(row).map(([column, value]) => [
      column,
      isMaskedColumn(column, extra) && value !== null && value !== undefined
        ? NEXUS_COPY.masked
        : redactValue(value),
    ])
  )

/**
 * Mask secrets in a typed text
 * @param {string} input - Command text
 * @return {string} - Safe text
 */

export const redactInput = (input: string): string =>
  input.replace(/--([A-Za-z0-9-]+)=("[^"]*"|\S+)/g, (match, name: string) =>
    isMaskedColumn(name) ? `--${name}=${NEXUS_COPY.masked}` : match
  )
