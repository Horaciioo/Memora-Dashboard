import { timeOf, toDayKey } from '@/utils/format/calendar'
import { formatDay, formatDayRange } from '@/utils/format/dates'

/**
 * Piece of a readable span
 * @typedef {Object} SpanPart
 * @property {string} text - Words
 * @property {boolean} strong - Carries the moment
 */

export interface SpanPart {
  text: string
  strong: boolean
}

/**
 * When an entry happens, moments marked apart from the glue words
 * @param {string} startsAt - ISO start
 * @param {string | null} endsAt - ISO end
 * @param {boolean} allDay - Spans whole days
 * @return {SpanPart[]} - Readable pieces
 */

export const entrySpanParts = (
  startsAt: string,
  endsAt: string | null,
  allDay: boolean
): SpanPart[] => {
  const sameDay = endsAt === null || toDayKey(startsAt) === toDayKey(endsAt)

  if (allDay) {
    return [
      { text: sameDay ? formatDay(startsAt) : formatDayRange(startsAt, endsAt), strong: true },
    ]
  }
  const moment = (iso: string) => [
    { text: formatDay(iso), strong: true },
    { text: ' de ', strong: false },
    { text: timeOf(iso), strong: true },
  ]
  if (endsAt === null) return moment(startsAt)

  return [
    { text: 'Du ', strong: false },
    ...moment(startsAt),
    { text: ' au ', strong: false },
    ...(sameDay ? [{ text: timeOf(endsAt), strong: true }] : moment(endsAt)),
  ]
}

/**
 * When an entry happens
 * @param {string} startsAt - ISO start
 * @param {string | null} endsAt - ISO end
 * @param {boolean} allDay - Spans whole days
 * @return {string} - Readable span
 */

export const entrySpan = (startsAt: string, endsAt: string | null, allDay: boolean): string =>
  entrySpanParts(startsAt, endsAt, allDay)
    .map((part) => part.text)
    .join('')
