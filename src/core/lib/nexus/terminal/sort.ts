/**
 * Sort rows by one column
 * @param {Record<string, unknown>[]} rows - Rows
 * @param {string | null} column - Column or null for the given order
 * @param {boolean} descending - Reverse order
 * @return {Record<string, unknown>[]} - Sorted copy
 */

export const sortRows = (
  rows: Record<string, unknown>[],
  column: string | null,
  descending: boolean
): Record<string, unknown>[] => {
  if (!column) return rows

  const sorted = [...rows].sort((left, right) => {
    const a = left[column]
    const b = right[column]
    if (a === b) return 0
    if (a === null || a === undefined) return 1
    if (b === null || b === undefined) return -1
    if (typeof a === 'number' && typeof b === 'number') return a - b

    return String(a).localeCompare(String(b), 'fr', { numeric: true })
  })

  return descending ? sorted.reverse() : sorted
}

/**
 * Column names across rows, first seen first
 * @param {Record<string, unknown>[]} rows - Rows
 * @return {string[]} - Columns
 */

export const columnsOfRows = (rows: Record<string, unknown>[]): string[] => [
  ...new Set(rows.flatMap((row) => Object.keys(row))),
]
