import { toDateTimeInput } from '@/utils/format/dates'
import { wallToInstant } from '@/utils/format/zone'

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
 * Hours as the form first shows them
 * @param {{ from: string, to: string } | null} given - Hours already given
 * @param {{ startsAt: string, endsAt: string | null }} entry - Event window
 * @return {HoursInput} - Wall clocks
 */

export const initialHours = (
  given: { from: string; to: string } | null,
  entry: { startsAt: string; endsAt: string | null }
): HoursInput => ({
  from: toDateTimeInput(given?.from ?? entry.startsAt),
  to: toDateTimeInput(given?.to ?? entry.endsAt),
})

/**
 * Hours as the request carries them
 * @param {HoursInput} hours - Wall clocks
 * @return {{ from: string, to: string } | undefined} - ISO instants, none when incomplete
 */

export const hoursPayload = (hours: HoursInput): { from: string; to: string } | undefined =>
  hours.from && hours.to
    ? { from: wallToInstant(hours.from).toISOString(), to: wallToInstant(hours.to).toISOString() }
    : undefined
