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
 * Whether a link is past its expiry, whatever else it went through
 * @param {LinkDates} link - Link dates
 * @param {Date} [now] - Moment of the check
 * @return {boolean} - Expiry reached
 */

export const isLinkExpired = (link: LinkDates, now: Date = new Date()): boolean =>
  link.expiresAt.getTime() <= now.getTime()

/**
 * State of a link at a moment
 * @param {LinkDates} link - Link dates
 * @param {Date} [now] - Moment of the check
 * @return {UnbanLinkStateName} - Link state
 */

export const linkStateOf = (link: LinkDates, now: Date = new Date()): UnbanLinkStateName => {
  if (link.revokedAt) return UnbanLinkStates.Revoked
  if (link.usedAt) return UnbanLinkStates.Used
  if (isLinkExpired(link, now)) return UnbanLinkStates.Expired

  return UnbanLinkStates.Active
}

/**
 * State a stranger holding the link meets
 * @param {LinkDates} link - Link dates
 * @param {Date} [now] - Moment of the check
 * @return {UnbanLinkStateName} - Access state
 */

export const accessStateOf = (link: LinkDates, now: Date = new Date()): UnbanLinkStateName => {
  if (link.revokedAt) return UnbanLinkStates.Revoked
  if (isLinkExpired(link, now)) return UnbanLinkStates.Expired

  return link.usedAt ? UnbanLinkStates.Used : UnbanLinkStates.Active
}
