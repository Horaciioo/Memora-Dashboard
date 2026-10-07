/**
 * Streaming platforms a live runs on
 * @type {Record<string, string>}
 */

export const LivePlatforms = {
  Twitch: 'TWITCH',
  YouTube: 'YOUTUBE',
} as const

export type LivePlatformName = (typeof LivePlatforms)[keyof typeof LivePlatforms]

/**
 * Lifecycle of an announced live
 * @type {Record<string, string>}
 */

export const LiveStatuses = {
  Announced: 'ANNOUNCED',
  Live: 'LIVE',
  Ended: 'ENDED',
  Cancelled: 'CANCELLED',
} as const

export type LiveStatusName = (typeof LiveStatuses)[keyof typeof LiveStatuses]

/**
 * Statuses that keep a live on the rail
 * @type {readonly LiveStatusName[]}
 */

export const OPEN_LIVE_STATUSES: readonly LiveStatusName[] = [
  LiveStatuses.Announced,
  LiveStatuses.Live,
]

/**
 * Answer of a member asked to coordinate a live
 * @type {Record<string, string>}
 */

export const CoordinationStatuses = {
  Asked: 'ASKED',
  Accepted: 'ACCEPTED',
  Declined: 'DECLINED',
} as const

export type CoordinationStatusName =
  (typeof CoordinationStatuses)[keyof typeof CoordinationStatuses]
