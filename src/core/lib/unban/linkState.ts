import { UnbanLinkStates } from '@/utils/constants/unban'
import type { UnbanLinkStateName } from '@/utils/constants/unban'

/**
 * Dates that decide a link's state
 * @typedef {Object} LinkDates
 * @property {Date | null} revokedAt - Revocation moment
 * @property {Date | null} usedAt - First use moment
 * @property {Date} expiresAt - Expiry moment
 */

export interface LinkDates {
  revokedAt: Date | null
  usedAt: Date | null
  expiresAt: Date
}

/**
 * State of a link at a moment
 * @param {LinkDates} link - Link dates
 * @param {Date} [now] - Moment of the check
 * @return {UnbanLinkStateName} - Link state
 */

export const linkStateOf = (link: LinkDates, now: Date = new Date()): UnbanLinkStateName => {
  if (link.revokedAt) return UnbanLinkStates.Revoked
  if (link.usedAt) return UnbanLinkStates.Used
  if (link.expiresAt.getTime() <= now.getTime()) return UnbanLinkStates.Expired

  return UnbanLinkStates.Active
}
