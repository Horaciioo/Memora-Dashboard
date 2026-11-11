/**
 * Keep some keys of a record
 * @param {Record<string, unknown>} row - Source record
 * @param {string[]} keys - Keys to keep
 * @return {Record<string, unknown>} - Smaller record
 */

export const pick = (row: Record<string, unknown>, keys: string[]): Record<string, unknown> =>
  Object.fromEntries(keys.filter((key) => key in row).map((key) => [key, row[key]]))

// Sorted JSON, key order never matters
const canonical = (value: unknown): string =>
  JSON.stringify(value, (_, entry) =>
    entry && typeof entry === 'object' && !Array.isArray(entry)
      ? Object.fromEntries(Object.entries(entry).sort(([a], [b]) => a.localeCompare(b)))
      : typeof entry === 'bigint'
        ? entry.toString()
        : entry
  )

/**
 * Deep equality of two plain values
 * @param {unknown} left - First value
 * @param {unknown} right - Second value
 * @return {boolean} - Same content
 */

export const sameValue = (left: unknown, right: unknown): boolean =>
  canonical(left) === canonical(right)

/**
 * Columns whose value differs
 * @param {Record<string, unknown>} before - Old values
 * @param {Record<string, unknown>} after - New values
 * @return {string[]} - Changed columns
 */

export const changedKeys = (
  before: Record<string, unknown>,
  after: Record<string, unknown>
): string[] => Object.keys(after).filter((key) => !sameValue(before[key], after[key]))
