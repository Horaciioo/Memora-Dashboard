import type { FormValues } from '@/types/forms'
import type { EventVisibilityName } from '@/utils/constants/workflow'

/**
 * Entry shown on the shared calendar
 * @typedef {Object} CalendarEntry
 * @property {string} id - Entry identifier
 * @property {string} title - Display title
 * @property {string | null} description - Supporting text
 * @property {string | null} typeId - Declared type
 * @property {string | null} typeName - Type label
 * @property {string | null} accent - Colour token of the type
 * @property {EventVisibilityName} visibility - Who the entry is shown to
 * @property {string} startsAt - ISO start
 * @property {string | null} endsAt - ISO end
 * @property {boolean} allDay - Spans the whole day
 * @property {string | null} ownerName - Who posted it
 * @property {boolean} readOnly - Projected from another domain, never edited here
 * @property {FormValues} values - Values feeding the edit form
 */

export interface CalendarEntry {
  id: string
  title: string
  description: string | null
  typeId: string | null
  typeName: string | null
  accent: string | null
  visibility: EventVisibilityName
  startsAt: string
  endsAt: string | null
  allDay: boolean
  ownerName: string | null
  readOnly: boolean
  values: FormValues
}

/**
 * Window the calendar is showing
 * @typedef {Object} CalendarRange
 * @property {string} from - ISO first day shown
 * @property {string} to - ISO last day shown
 */

export interface CalendarRange {
  from: string
  to: string
}
