import 'server-only'

import { randomBytes } from 'node:crypto'

import { REALTIME_SETTINGS } from '@/declarations/system/realtime'
import type { SessionUser } from '@/types/auth'
import { SECOND_MS } from '@/utils/constants/time'

/**
 * Session held until its socket opens
 * @typedef {Object} HeldTicket
 */

interface HeldTicket {
  session: SessionUser
  expiresAt: number
}

// Survives dev hot reloads, shared with the upgrade
const globalForTickets = globalThis as unknown as { realtimeTickets?: Map<string, HeldTicket> }

const tickets = (globalForTickets.realtimeTickets ??= new Map())

/**
 * Hand a one-time socket ticket to a signed-in member
 * @param {SessionUser} session - Member
 * @return {string} - Ticket
 */

export const issueTicket = (session: SessionUser): string => {
  const now = Date.now()
  for (const [key, held] of tickets) if (held.expiresAt < now) tickets.delete(key)

  const ticket = randomBytes(24).toString('base64url')
  tickets.set(ticket, { session, expiresAt: now + REALTIME_SETTINGS.ticketSeconds * SECOND_MS })

  return ticket
}

/**
 * Spend a ticket, once
 * @param {string | null} ticket - Ticket from the socket address
 * @return {SessionUser | null} - Member, null when unknown or stale
 */

export const redeemTicket = (ticket: string | null): SessionUser | null => {
  if (!ticket) return null
  const held = tickets.get(ticket)
  tickets.delete(ticket)

  return held && held.expiresAt >= Date.now() ? held.session : null
}
