// Leading characters a spreadsheet reads as a formula
const FORMULA_START = /^[=+\-@\t\r]/

// Marker that makes a spreadsheet read UTF-8
const BYTE_ORDER_MARK = '﻿'

/**
 * One quoted, neutralised cell
 * @param {string | number | null} value - Raw value
 * @return {string} - Cell text
 */

const cell = (value: string | number | null): string => {
  const text = value === null ? '' : String(value)
  const safe = typeof value === 'string' && FORMULA_START.test(text) ? `'${text}` : text

  return `"${safe.replaceAll('"', '""')}"`
}

/**
 * Rows as a semicolon CSV a French spreadsheet opens as is
 * @param {readonly string[]} header - Column titles
 * @param {(string | number | null)[][]} rows - Rows
 * @return {string} - CSV document
 */

export const toCsv = (header: readonly string[], rows: (string | number | null)[][]): string =>
  BYTE_ORDER_MARK + [header, ...rows].map((row) => row.map(cell).join(';')).join('\r\n')
