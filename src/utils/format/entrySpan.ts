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
  const moment = (iso: string) => `${formatDay(iso)} ${timeOf(iso)}`
  if (endsAt === null) return [{ text: moment(startsAt), strong: true }]

  return [
    { text: 'De ', strong: false },
    { text: moment(startsAt), strong: true },
    { text: ' à ', strong: false },
    { text: sameDay ? timeOf(endsAt) : moment(endsAt), strong: true },
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
