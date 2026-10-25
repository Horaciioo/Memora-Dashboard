import { MODVIEW_DURATION_COPY, MODVIEW_SPAN_COPY } from '@/declarations/modview/copy'
import { DATE_LOCALE } from '@/declarations/ui/dates'
import { DAY_SECONDS, HOUR_SECONDS } from '@/utils/constants/time'

const MINUTE = 60
/**
 * Say a timeout length in words
 * @param {number} seconds - Length
 * @return {string} - Spoken length
 */

export const formatDuration = (seconds: number): string => {
  if (seconds >= DAY_SECONDS && seconds % DAY_SECONDS === 0) {
    return MODVIEW_DURATION_COPY.days.replace('{count}', String(seconds / DAY_SECONDS))
  }
  if (seconds >= HOUR_SECONDS && seconds % HOUR_SECONDS === 0) {
    return MODVIEW_DURATION_COPY.hours.replace('{count}', String(seconds / HOUR_SECONDS))
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

/**
 * Say a spent time
 * @param {number} seconds - Time spent
 * @return {string} - Spoken time
 */

export const formatSpan = (seconds: number): string => {
  const hours = Math.floor(seconds / HOUR_SECONDS)
  const minutes = Math.floor((seconds % HOUR_SECONDS) / MINUTE)

  if (hours > 0) {
    return MODVIEW_SPAN_COPY.hours
      .replace('{hours}', String(hours))
      .replace('{minutes}', String(minutes).padStart(2, '0'))
  }
  if (minutes > 0) return MODVIEW_SPAN_COPY.minutes.replace('{minutes}', String(minutes))

  return MODVIEW_SPAN_COPY.seconds.replace('{seconds}', String(Math.max(0, Math.round(seconds))))
}

/**
 * Say a spent time to the second
 * @param {number} seconds - Time spent
 * @return {string} - Exact time, or under a minute
 */

export const formatExactSpan = (seconds: number): string => {
  const total = Math.round(seconds)
  if (total < MINUTE) return MODVIEW_SPAN_COPY.underMinute

  return [
    [Math.floor(total / HOUR_SECONDS), MODVIEW_SPAN_COPY.unitHour],
    [Math.floor((total % HOUR_SECONDS) / MINUTE), MODVIEW_SPAN_COPY.unitMinute],
    [total % MINUTE, MODVIEW_SPAN_COPY.unitSecond],
  ]
    .filter(([count]) => count !== 0)
    .map(([count, unit]) => `${count} ${unit}`)
    .join(' ')
}
