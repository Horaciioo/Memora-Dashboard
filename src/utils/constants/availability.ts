/**
 * How a member chooses to show
 * @type {Record<string, string>}
 */

export const Availabilities = {
  Online: 'ONLINE',
  Offline: 'OFFLINE',
  Dnd: 'DND',
} as const

export type AvailabilityName = (typeof Availabilities)[keyof typeof Availabilities]
