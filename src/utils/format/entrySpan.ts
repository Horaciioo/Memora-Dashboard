import { timeOf, toDayKey } from '@/utils/format/calendar'
import { formatDay, formatDayRange, formatDayTime } from '@/utils/format/dates'

/**
 * When an entry happens, on one line
 * @param {string} startsAt - ISO start
 * @param {string | null} endsAt - ISO end
 * @param {boolean} allDay - Spans whole days
 * @return {string} - Readable span
 */

export const entrySpan = (startsAt: string, endsAt: string | null, allDay: boolean): string => {
  const sameDay = endsAt === null || toDayKey(startsAt) === toDayKey(endsAt)

  if (allDay) return sameDay ? formatDay(startsAt) : formatDayRange(startsAt, endsAt)
  if (endsAt === null) return formatDayTime(startsAt)
  if (sameDay) return `${formatDay(startsAt)} · ${timeOf(startsAt)} → ${timeOf(endsAt)}`

  return `${formatDayTime(startsAt)} → ${formatDayTime(endsAt)}`
}
