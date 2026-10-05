import type { DurationFormat } from '@/declarations/sanctions/registries'

// Minutes in one hour and one day
const HOUR_MINUTES = 60
const DAY_MINUTES = 1440

/**
 * Write a duration the way a surface reads it
 * @param {number} minutes - Length in minutes
 * @param {DurationFormat} format - Surface format
 * @return {string} - Written duration
 */

export const writeDuration = (minutes: number, format: DurationFormat): string => {
  if (format === 'seconds') return String(minutes * 60)

  // Marsha takes the largest whole unit
  if (minutes % DAY_MINUTES === 0) return `${minutes / DAY_MINUTES}d`
  if (minutes % HOUR_MINUTES === 0) return `${minutes / HOUR_MINUTES}h`

  return `${minutes}m`
}

/**
 * Fill a command template
 * @param {string} template - Command with its {user}
 * @param {Record<string, string>} values - Hole values
 * @return {string} - Command ready to paste
 */

export const fillCommand = (template: string, values: Record<string, string>): string =>
  template.replace(/\{(\w+)\}/g, (hole, key: string) => values[key] ?? hole).trim()
