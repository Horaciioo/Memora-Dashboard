import type { NotificationTargetName } from '@/declarations/notifications/targets'
import type { RecapBeatName } from '@/declarations/recap/beats'
import type { RecapTierName } from '@/declarations/recap/tiers'
import type { PermissionHelpers } from '@/types/auth'
import type { NotificationKindName } from '@/utils/constants/notifications'

/**
 * Member shown on a beat
 * @typedef {Object} RecapPerson
 * @property {string} id - Account identifier
 * @property {string} name - Display name
 * @property {string | null} avatar - Portrait
 */

export interface RecapPerson {
  id: string
  name: string
  avatar: string | null
}

/**
 * Small tally under a beat
 * @typedef {Object} RecapFigure
 * @property {string} key - Figure kind, read in RECAP_FIGURES
 * @property {number} count - How many
 */

export interface RecapFigure {
  key: string
  count: number
}

/**
 * Something that moved, as a source reports it
 * @typedef {Object} RecapDraft
 * @property {RecapBeatName} beat - Kind of movement
 * @property {NotificationKindName} [alert] - Notification kind behind an alert beat
 * @property {Date} at - Latest moment
 * @property {string[]} actorIds - Who moved it
 * @property {number} count - Occurrences folded in
 * @property {NotificationTargetName | null} target - Record it sits on
 * @property {string | null} targetId - Record identifier
 * @property {string | null} subject - Record title
 * @property {RecapFigure[]} [figures] - Tally under the beat
 */

export interface RecapDraft {
  beat: RecapBeatName
  alert?: NotificationKindName
  at: Date
  actorIds: string[]
  count: number
  target: NotificationTargetName | null
  targetId: string | null
  subject: string | null
  figures?: RecapFigure[]
}

/**
 * One movement ready for display
 * @typedef {Object} RecapBeat
 * @property {string} id - Stable key inside its thread
 * @property {RecapBeatName} beat - Kind of movement
 * @property {NotificationKindName | null} alert - Notification kind behind an alert beat
 * @property {string} at - ISO moment of the latest occurrence
 * @property {RecapPerson[]} people - First actors
 * @property {number} others - Actors beyond the ones shown
 * @property {number} count - Occurrences folded in
 * @property {RecapFigure[]} figures - Tally under the beat
 */

export interface RecapBeat {
  id: string
  beat: RecapBeatName
  alert: NotificationKindName | null
  at: string
  people: RecapPerson[]
  others: number
  count: number
  figures: RecapFigure[]
}

/**
 * Everything that moved around one record
 * @typedef {Object} RecapThread
 * @property {string} key - Stable key
 * @property {RecapTierName} tier - Weight of its heaviest beat
 * @property {NotificationTargetName | null} target - Record kind
 * @property {string | null} targetId - Record identifier
 * @property {string | null} subject - Record title
 * @property {string} at - ISO moment of the latest beat
 * @property {RecapBeat[]} beats - Newest first
 */

export interface RecapThread {
  key: string
  tier: RecapTierName
  target: NotificationTargetName | null
  targetId: string | null
  subject: string | null
  at: string
  beats: RecapBeat[]
}

/**
 * What the member missed
 * @typedef {Object} Recap
 * @property {string} since - ISO start of the window
 * @property {string} until - ISO end of the window
 * @property {boolean} isAway - Gone long enough to be welcomed back
 * @property {boolean} isDemo - Made up, for the dev build
 * @property {boolean} demoAvailable - The dev build can show a made-up one
 * @property {RecapThread[]} threads - Heaviest first
 */

export interface Recap {
  since: string
  until: string
  isAway: boolean
  isDemo: boolean
  demoAvailable: boolean
  threads: RecapThread[]
}

/**
 * What a source reads from
 * @typedef {Object} RecapContext
 * @property {string} accountId - Member the recap is for
 * @property {Date} since - Start of the window
 * @property {Date} until - End of the window
 * @property {PermissionHelpers} access - Rights of the member
 */

export interface RecapContext {
  accountId: string
  since: Date
  until: Date
  access: PermissionHelpers
}
