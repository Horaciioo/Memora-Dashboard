import { MODVIEW_DURATION_COPY } from '@/declarations/modview/copy'
import { DATE_LOCALE } from '@/declarations/ui/dates'

const MINUTE = 60
const HOUR = 3600
const DAY = 86_400

/**
 * Say a timeout length in words
 * @param {number} seconds - Length
 * @return {string} - Spoken length
 */

export const formatDuration = (seconds: number): string => {
  if (seconds >= DAY && seconds % DAY === 0) {
    return MODVIEW_DURATION_COPY.days.replace('{count}', String(seconds / DAY))
  }
  if (seconds >= HOUR && seconds % HOUR === 0) {
    return MODVIEW_DURATION_COPY.hours.replace('{count}', String(seconds / HOUR))
  }
  if (seconds >= MINUTE && seconds % MINUTE === 0) {
    return MODVIEW_DURATION_COPY.minutes.replace('{count}', String(seconds / MINUTE))
  }

  return MODVIEW_DURATION_COPY.seconds.replace('{count}', String(seconds))
}

/**
 * Hour and minute of a chat line
 * @param {string} iso - Moment
 * @return {string} - Clock reading
 */

export const formatClock = (iso: string): string =>
  new Date(iso).toLocaleTimeString(DATE_LOCALE, { hour: '2-digit', minute: '2-digit' })
