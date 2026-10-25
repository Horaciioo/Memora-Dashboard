import { DATE_LOCALE } from '@/declarations/ui/dates'

/**
 * Format number with commas
 * @param {number} num - Number
 * @return {string} - Formatted number
 */

export function formatNumber(num: number): string {
  return num.toLocaleString(DATE_LOCALE)
}

/**
 * Format a ratio as a percentage
 * @param {number} ratio - Ratio, one for the whole
 * @return {string} - Rounded percentage
 */

export function formatPercent(ratio: number): string {
  return ratio.toLocaleString(DATE_LOCALE, { style: 'percent', maximumFractionDigits: 0 })
}

/**
 * Format with K
 * @param {number} num - Number
 * @return {string} - Number with units
 */

export function formatNumberWithUnits(num: number): string {
  if (num < 1000) {
    return num.toString()
  }

  if (num < 1000000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  }

  if (num < 1000000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
  }

  return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B'
}

/**
 * Format number readable
 * @param {number} num - Number
 * @return {string} - Formatted number
 */

export function formatNumberReadable(num: number): string {
  return formatNumber(num)
}

// Byte unit ladder
const BYTE_UNITS = ['o', 'ko', 'Mo', 'Go', 'To']

const BYTE_STEP = 1000

/**
 * Format a byte count
 * @param {number} bytes - Byte count
 * @return {string} - Count and its unit
 */

export function formatBytes(bytes: number): string {
  const rung =
    bytes < BYTE_STEP
      ? 0
      : Math.min(Math.floor(Math.log(bytes) / Math.log(BYTE_STEP)), BYTE_UNITS.length - 1)

  const value = bytes / BYTE_STEP ** rung
  const digits = rung === 0 ? 0 : 1

  return `${value.toLocaleString(DATE_LOCALE, { maximumFractionDigits: digits })} ${BYTE_UNITS[rung]}`
}
