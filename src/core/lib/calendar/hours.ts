import { invalidInput } from '@/core/lib/errors'
import { CALENDAR_COPY } from '@/declarations/calendar/copy'

/**
 * Read the hours of a roll-call answer
 * @param {Record<string, unknown>} raw - Request body
 * @return {{ from: Date, to: Date } | null} - Hours, none when not given
 */

export const readHours = (raw: Record<string, unknown>): { from: Date; to: Date } | null => {
  const { from, to } = raw
  if (!from && !to) return null

  const start = new Date(String(from))
  const end = new Date(String(to))
  if (Number.isNaN(+start) || Number.isNaN(+end) || start >= end) {
    throw invalidInput([{ field: 'from', message: CALENDAR_COPY.badHours }])
  }

  return { from: start, to: end }
}
