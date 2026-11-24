import { HOUR_MS, MINUTE_SECONDS } from '@/utils/constants/time'
import { toDateTimeInput } from '@/utils/format/time/dates'
import { wallToInstant } from '@/utils/format/time/zone'

/**
 * Hours as wall clocks of the form
 * @typedef {Object} HoursInput
 * @property {string} from - Wall clock the hours start
 * @property {string} to - Wall clock the hours end
 */

export interface HoursInput {
  from: string
  to: string
}

/**
 * Hours first shown, planned end ignored
 * @param {{ from: string, to: string } | null} given - Hours already given
 * @param {string} startsAt - ISO start of the live
 * @param {number} hoursAhead - Hours proposed
 * @return {HoursInput} - Wall clocks
 */

export const initialHours = (
  given: { from: string; to: string } | null,
  startsAt: string,
  hoursAhead: number
): HoursInput => {
  const from = given?.from ?? startsAt
  const to =
    given?.to ?? new Date(Math.round((Date.parse(from) + hoursAhead * HOUR_MS) / HOUR_MS) * HOUR_MS)

  return { from: toDateTimeInput(from), to: toDateTimeInput(to) }
}

/**
 * Hours as the request carries them
 * @param {HoursInput} hours - Wall clocks
 * @return {{ from: string, to: string } | undefined} - ISO instants, none when incomplete
 */

export const hoursPayload = (hours: HoursInput): { from: string; to: string } | undefined =>
  hours.from && hours.to
    ? { from: wallToInstant(hours.from).toISOString(), to: wallToInstant(hours.to).toISOString() }
    : undefined

// Minutes in an hour
const MINUTES_PER_HOUR = 60

// Length rounded to the nearest quarter hour
const QUARTER_HOUR = 15

/**
 * Length said roughly, to the nearest quarter hour
 * @param {number} minutes - Length in minutes
 * @return {string} - Like 45 min, 1h or 1h15
 */

export const roughDuration = (minutes: number): string => {
  const rounded = Math.max(QUARTER_HOUR, Math.round(minutes / QUARTER_HOUR) * QUARTER_HOUR)
  const hours = Math.floor(rounded / 60)
  const rest = rounded % 60

  if (hours === 0) return `${rest} min`

  return rest === 0 ? `${hours}h` : `${hours}h${String(rest).padStart(2, '0')}`
}

/**
 * Moderation time said to the minute, never rounded up to a quarter hour
 * @param {number} seconds - Length in seconds
 * @return {string} - Like 3 min, 45 min, 1h or 1h05
 */

export const minutesDuration = (seconds: number): string => {
  const minutes = Math.max(1, Math.round(seconds / MINUTE_SECONDS))
  const hours = Math.floor(minutes / MINUTES_PER_HOUR)
  const rest = minutes % MINUTES_PER_HOUR

  if (hours === 0) return `${rest} min`

  return rest === 0 ? `${hours}h` : `${hours}h${String(rest).padStart(2, '0')}`
}
