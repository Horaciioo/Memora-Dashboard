import type { AttendancePerson } from '@/types/calendar'

/**
 * Live that asks a member whether they are there
 * @typedef {Object} LiveAsk
 * @property {string} eventId - Roll-call event
 * @property {string} liveId - Live
 * @property {string} title - Live title
 * @property {string} creator - Creator of the live
 * @property {string} startsAt - ISO start
 * @property {string | null} endsAt - ISO end
 */

export interface LiveAsk {
  eventId: string
  liveId: string
  title: string
  creator: string
  startsAt: string
  endsAt: string | null
}

/**
 * A member who just said they come to a live
 * @typedef {Object} LiveDeclared
 * @property {string} key - One per declaration, a new answer is new news
 * @property {string} eventId - Roll-call event
 * @property {string} liveId - Live
 * @property {string} title - Live title
 * @property {string} name - Who comes
 * @property {string | null} from - ISO start of their window
 * @property {string | null} to - ISO end of their window
 */

export interface LiveDeclared {
  key: string
  eventId: string
  liveId: string
  title: string
  name: string
  from: string | null
  to: string | null
}

/**
 * Who answered what on one live
 * @typedef {Object} LiveGroups
 * @property {string} title - Live title
 * @property {AttendancePerson[]} present - Said they come
 * @property {AttendancePerson[]} absent - Said they do not
 * @property {AttendancePerson[]} pending - Not answered
 * @property {AttendancePerson[]} onLeave - Under declared leave
 */

export interface LiveGroups {
  title: string
  present: AttendancePerson[]
  absent: AttendancePerson[]
  pending: AttendancePerson[]
  onLeave: AttendancePerson[]
}

/**
 * What the live bubble reads
 * @typedef {Object} LiveAsksPayload
 * @property {LiveAsk[]} asks - Lives waiting on the member
 * @property {LiveDeclared[]} declared - News for the ones who run the live, empty for others
 */

export interface LiveAsksPayload {
  asks: LiveAsk[]
  declared: LiveDeclared[]
}
