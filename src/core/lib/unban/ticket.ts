import { seal, unseal } from '@/core/lib/unban/seal'
import { UNBAN_SETTINGS } from '@/declarations/configurations/settings'
import { MINUTE_MS } from '@/utils/constants/time'

/**
 * Discord account a person proved they hold
 * @typedef {Object} UnbanIdentity
 * @property {string} discordId - Discord identifier
 * @property {string} name - Display name
 * @property {string | null} avatar - Avatar hash
 */

export interface UnbanIdentity {
  discordId: string
  name: string
  avatar: string | null
}

/**
 * What the cookie carries between the link and the server
 * @typedef {Object} UnbanTicket
 * @property {string} creator - Creator slug the ticket belongs to
 * @property {UnbanIdentity} [identity] - Account proven, absent while the round trip is open
 * @property {number} at - Moment it was issued, in ms
 */

export interface UnbanTicket {
  creator: string
  identity?: UnbanIdentity
  at: number
}

/**
 * Seal a ticket for its cookie
 * @param {Omit<UnbanTicket, 'at'>} ticket - Ticket
 * @param {number} [now] - Moment of issue
 * @return {string} - Cookie value
 */

export const packUnbanTicket = (
  ticket: Omit<UnbanTicket, 'at'>,
  now: number = Date.now()
): string => seal({ ...ticket, at: now })

// Text of a sealed field, none when absent or of another type
const textOf = (value: unknown): string | null =>
  typeof value === 'string' && value.length > 0 ? value : null

/**
 * Identity read back from a sealed ticket
 * @param {unknown} raw - Sealed content
 * @return {UnbanIdentity | undefined} - Identity
 */

const readIdentity = (raw: unknown): UnbanIdentity | undefined => {
  if (typeof raw !== 'object' || raw === null) return undefined
  const { discordId, name, avatar } = raw as Record<string, unknown>
  const id = textOf(discordId)
  const label = textOf(name)

  return id && label ? { discordId: id, name: label, avatar: textOf(avatar) } : undefined
}

/**
 * Read a ticket back from its cookie, a stale or tampered one is nothing
 * @param {string | undefined} packed - Cookie value
 * @param {number} [now] - Moment of the reading
 * @return {UnbanTicket | null} - Ticket
 */

export const unpackUnbanTicket = (
  packed: string | undefined,
  now: number = Date.now()
): UnbanTicket | null => {
  const content = unseal(packed)
  const creator = textOf(content?.creator)
  if (!content || !creator || typeof content.at !== 'number') return null

  // The identity outlives the sign-in round trip, but not the filling
  if (now - content.at > UNBAN_SETTINGS.ticketMinutes * MINUTE_MS) return null

  return { creator, identity: readIdentity(content.identity), at: content.at }
}

/**
 * Identity a ticket proves for one creator, none for another creator's ticket
 * @param {UnbanTicket | null} ticket - Ticket
 * @param {string} creator - Creator slug opened
 * @return {UnbanIdentity | null} - Proven account
 */

export const identityFor = (ticket: UnbanTicket | null, creator: string): UnbanIdentity | null =>
  ticket && ticket.creator === creator ? (ticket.identity ?? null) : null
