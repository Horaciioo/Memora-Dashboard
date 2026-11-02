/**
 * What a connected tab reports
 * @type {'active' | 'idle'}
 */

export type PresenceActivity = 'active' | 'idle'

/**
 * How a member stands in a room
 * @type {'active' | 'idle' | 'left'}
 */

export type PresenceStatus = PresenceActivity | 'left'

/**
 * State one tab sends
 * @typedef {Object} PresenceState
 * @property {PresenceActivity} activity - Active or idle
 * @property {string | null} place - Where in the space
 */

export interface PresenceState {
  activity: PresenceActivity
  place: string | null
}

/**
 * One tab seated in a room
 * @typedef {Object} PresenceSeat
 */

export interface PresenceSeat extends PresenceState {
  accountId: string
  name: string
  image: string | null
  // Last report, epoch milliseconds
  at: number
}

/**
 * One member of a room, every tab merged
 * @typedef {Object} PresenceMember
 */

export interface PresenceMember {
  accountId: string
  name: string
  image: string | null
  status: PresenceStatus
  place: string | null
  at: number
}
