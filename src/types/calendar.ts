import type { FormValues } from '@/types/forms'
import type {
  AttendanceStatusName,
  CalendarKindName,
  CalendarSourceName,
  EventVisibilityName,
} from '@/utils/constants/workflow'

/**
 * Convened member on a roll-call roster
 * @typedef {Object} AttendancePerson
 * @property {string} name - Display name
 * @property {string | null} avatar - Portrait
 */

export interface AttendancePerson {
  name: string
  avatar: string | null
}

/**
 * Roll-call standings attached to an entry
 * @typedef {Object} AttendanceRoster
 * @property {AttendanceStatusName | null} mine - Viewer's own answer
 * @property {boolean} canManage - Viewer runs this roll-call
 * @property {boolean} visible - Viewer may see the name lists
 * @property {{ present: number, absent: number, pending: number }} counts - Head count per answer
 * @property {AttendancePerson[]} present - Filled only when visible
 * @property {AttendancePerson[]} absent - Filled only when visible
 * @property {AttendancePerson[]} pending - Filled only when visible
 */

export interface AttendanceRoster {
  mine: AttendanceStatusName | null
  canManage: boolean
  visible: boolean
  counts: { present: number; absent: number; pending: number }
  present: AttendancePerson[]
  absent: AttendancePerson[]
  pending: AttendancePerson[]
}

/**
 * Entry shown on the shared calendar
 * @typedef {Object} CalendarEntry
 * @property {string} id - Entry identifier
 * @property {CalendarSourceName} source - Domain the entry was read from
 * @property {CalendarKindName} kind - Shape it draws as
 * @property {string} title - Display title
 * @property {string | null} emoji - Glyph drawn before the title
 * @property {string | null} description - Supporting text
 * @property {string | null} templateId - Template it was started from
 * @property {string | null} templateName - Template label
 * @property {string | null} accent - Colour of the creator it belongs to
 * @property {string | null} youtuberId - Creator it belongs to
 * @property {boolean} muted - Drawn in retreat
 * @property {EventVisibilityName} visibility - Who the entry is shown to
 * @property {string} startsAt - ISO start
 * @property {string | null} endsAt - ISO end
 * @property {boolean} allDay - Spans the whole day
 * @property {string | null} ownerName - Who posted it
 * @property {string | null} subjectName - Member the entry is about
 * @property {string | null} href - Page of the record it stands for
 * @property {string | null} body - Markdown content of that record
 * @property {{ emoji: string | null, title: string }[]} [topics] - Meeting subject titles
 * @property {string | null} [minutes] - Meeting write-up
 * @property {boolean} readOnly - Projected from another domain
 * @property {boolean} rollCall - Asks its convened members to confirm presence
 * @property {AttendanceRoster | null} attendance - Roll-call standings
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
  youtuberId: string | null
  muted: boolean
  visibility: EventVisibilityName
  startsAt: string
  endsAt: string | null
  allDay: boolean
  ownerName: string | null
  subjectName: string | null
  href: string | null
  body: string | null
  topics?: { emoji: string | null; title: string }[]
  minutes?: string | null
  readOnly: boolean
  rollCall: boolean
  attendance: AttendanceRoster | null
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
