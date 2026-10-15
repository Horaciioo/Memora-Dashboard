import type { ActivityEntry } from '@/core/services/system/ActivityService'
import { JOURNAL_COPY } from '@/declarations/system/journal'
import { EVENT_TYPES, LOG_LEVELS } from '@/utils/constants/events'

// Leading characters a spreadsheet reads as a formula
const FORMULA_START = /^[=+\-@\t\r]/

// One quoted, neutralised cell
const cell = (value: string | null): string => {
  const text = value ?? ''
  const safe = FORMULA_START.test(text) ? `'${text}` : text

  return `"${safe.replaceAll('"', '""')}"`
}

/**
 * Journal entries as CSV text
 * @param {ActivityEntry[]} entries - Entries to write
 * @return {string} - CSV document
 */

export const toActivityCsv = (entries: ActivityEntry[]): string => {
  const rows = entries.map((entry) =>
    [
      entry.createdAt,
      LOG_LEVELS.byName(entry.level).label,
      entry.event ? EVENT_TYPES.byName(entry.event).label : '',
      entry.origin,
      entry.actorName,
      entry.summary,
      entry.ip,
      entry.route,
      entry.userAgent,
      entry.targetType ? `${entry.targetType} ${entry.targetId ?? ''}`.trim() : null,
    ]
      .map(cell)
      .join(',')
  )

  return [JOURNAL_COPY.csvHeader.map(cell).join(','), ...rows].join('\n')
}
