import { NEXUS_OBSERVABILITY } from '@/declarations/nexus/observability'

/**
 * Browser error as the server keeps it
 * @typedef {Object} ClientErrorReport
 * @property {string} message - First line
 * @property {string} stack - Frames
 * @property {string} path - Page path, no query
 */

export interface ClientErrorReport {
  message: string
  stack: string
  path: string
}

// Most reports in one call
const BATCH_MAX = 5

// Clip a field that arrived as anything
const clip = (value: unknown, max: number): string =>
  typeof value === 'string' ? value.slice(0, max) : ''

// Path without query or fragment
const pathOf = (value: unknown): string => clip(value, 200).split(/[?#]/)[0] || '/'

/**
 * Read a browser report, nothing unknown is kept
 * @param {unknown} raw - Body
 * @param {number} size - Declared body size in bytes
 * @return {ClientErrorReport[] | null} - Reports or null when unreadable
 */

export const readClientErrors = (raw: unknown, size: number): ClientErrorReport[] | null => {
  if (size > NEXUS_OBSERVABILITY.clientMaxBytes) return null

  const list = (raw as { errors?: unknown } | null)?.errors
  if (!Array.isArray(list) || list.length === 0) return null

  const reports = list
    .slice(0, BATCH_MAX)
    .map((entry) => {
      const item = (entry ?? {}) as Record<string, unknown>

      return {
        message: clip(item.message, 300).split('\n')[0],
        stack: clip(item.stack, 2000),
        path: pathOf(item.path),
      }
    })
    .filter((report) => report.message.length > 0)

  return reports.length > 0 ? reports : null
}
