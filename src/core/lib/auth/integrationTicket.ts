import { cookieName } from '@/utils/constants/cookies'

/**
 * Integration ticket cookie name
 * @type {string}
 */

export const INTEGRATION_TICKET_COOKIE = cookieName('integrationClaim')

/**
 * What the integration flow carries between the link, Discord and the form
 * @typedef {Object} IntegrationTicket
 * @property {string} token - Link the ticket belongs to
 * @property {string} [claimId] - Identity resolved by the callback
 */

export interface IntegrationTicket {
  token: string
  claimId?: string
}

/**
 * Serialise a ticket for its cookie
 * @param {IntegrationTicket} ticket - Ticket
 * @return {string} - Cookie value
 */

export const packTicket = (ticket: IntegrationTicket): string =>
  Buffer.from(JSON.stringify(ticket)).toString('base64url')

/**
 * Read a ticket back from its cookie
 * @param {string | undefined} packed - Cookie value
 * @return {IntegrationTicket | null} - Ticket
 */

export const unpackTicket = (packed: string | undefined): IntegrationTicket | null => {
  if (!packed) return null

  try {
    const parsed: unknown = JSON.parse(Buffer.from(packed, 'base64url').toString('utf8'))
    if (typeof parsed !== 'object' || parsed === null) return null

    const { token, claimId } = parsed as Record<string, unknown>
    if (typeof token !== 'string' || token.length === 0) return null

    return { token, ...(typeof claimId === 'string' ? { claimId } : {}) }
  } catch {
    return null
  }
}
