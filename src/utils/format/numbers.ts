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
 * Format with K, M, B units
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
