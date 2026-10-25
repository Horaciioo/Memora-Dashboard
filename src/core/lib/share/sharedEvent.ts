import { SHARE_COPY } from '@/declarations/share/copy'

// Address of the showcase ticket, the only one that shows details
export const DEMO_EVENT_ID = 'demonstration'

// Record identifier shape
export const EVENT_ID_PATTERN = /^c[a-z0-9]{24}$/

/**
 * What a shared event card shows, nothing a stranger should not read
 * @typedef {Object} SharedEvent
 * @property {string} title - Card title
 * @property {string} when - One line of when
 * @property {{ month: string, day: string, weekday: string } | null} date - Stub of the ticket
 * @property {string | null} hours - Opening and closing times
 * @property {string} scope - Who the event is for
 */

export interface SharedEvent {
  title: string
  when: string
  date: { month: string; day: string; weekday: string } | null
  hours: string | null
  scope: string
}

// Made up ticket shown on the showcase link
const DEMO_EVENT: SharedEvent = {
  title: SHARE_COPY.demoTitle,
  when: SHARE_COPY.demoWhen,
  date: { month: SHARE_COPY.demoMonth, day: SHARE_COPY.demoDay, weekday: SHARE_COPY.demoWeekday },
  hours: SHARE_COPY.demoHours,
  scope: SHARE_COPY.scopeAll,
}

// Shown for any real record until its owner chooses what to share
const GENERIC_EVENT: SharedEvent = {
  title: SHARE_COPY.genericTitle,
  when: SHARE_COPY.genericWhen,
  date: null,
  hours: null,
  scope: SHARE_COPY.scopeAll,
}

/**
 * Card content of one shared address
 * @param {string} id - Address segment
 * @return {SharedEvent | null} - Card, null when the address is not a share link
 */

export const readSharedEvent = (id: string): SharedEvent | null => {
  if (id === DEMO_EVENT_ID) return DEMO_EVENT

  return EVENT_ID_PATTERN.test(id) ? GENERIC_EVENT : null
}
