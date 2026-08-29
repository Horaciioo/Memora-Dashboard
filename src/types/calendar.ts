import type { FormValues } from '@/types/forms'
import type {
  CalendarKindName,
  CalendarSourceName,
  EventVisibilityName,
} from '@/utils/constants/workflow'

/**
 * Entry shown on the shared calendar, whichever domain it was read from
 * @typedef {Object} CalendarEntry
 * @property {string} id - Entry identifier, prefixed on a projection
 * @property {CalendarSourceName} source - Domain the entry was read from
 * @property {CalendarKindName} kind - Shape it draws as
 * @property {string} title - Display title
 * @property {string | null} emoji - Glyph drawn before the title
 * @property {string | null} description - Supporting text
 * @property {string | null} templateId - Template it was started from
 * @property {string | null} templateName - Template label
 * @property {string | null} accent - Resolved colour, the function of its member first
 * @property {string} legendLabel - Legend row it belongs to
 * @property {EventVisibilityName} visibility - Who the entry is shown to
 * @property {string} startsAt - ISO start
 * @property {string | null} endsAt - ISO end
 * @property {boolean} allDay - Spans the whole day
 * @property {string | null} ownerName - Who posted it
 * @property {string | null} subjectName - Member the entry is about
 * @property {string | null} href - Page of the record it stands for
 * @property {string | null} body - Markdown content of that record
 * @property {boolean} readOnly - Projected from another domain, never edited here
 * @property {FormValues} values - Values feeding the edit form
 */

export interface CalendarEntry {
  id: string
  source: CalendarSourceName
  kind: CalendarKindName
  title: string
  emoji: string | null
  description: string | null
  templateId: string | null
  templateName: string | null
  accent: string | null
  legendLabel: string
  visibility: EventVisibilityName
  startsAt: string
  endsAt: string | null
  allDay: boolean
  ownerName: string | null
  subjectName: string | null
  href: string | null
  body: string | null
  readOnly: boolean
  values: FormValues
}

/**
 * Colour a legend row stands for
 * @typedef {Object} CalendarLegendRow
 * @property {string} key - Row identifier
 * @property {string} label - Display label
 * @property {string} accent - Colour drawn beside the label
 * @property {number} count - Entries the row covers in the window on screen
 */

export interface CalendarLegendRow {
  key: string
  label: string
  accent: string
  count: number
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
