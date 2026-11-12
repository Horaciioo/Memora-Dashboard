import 'server-only'

import { cookies } from 'next/headers'

import { UNBAN_TICKET_COOKIE, unbanCookieOptions } from '@/core/lib/auth/unbanTicket'
import { packUnbanTicket, unpackUnbanTicket } from '@/core/lib/unban/ticket'
import type { UnbanTicket } from '@/core/lib/unban/ticket'
import type { DiscordIdentity } from '@/core/services/auth/DiscordService'
import { claimUnbanIdentity } from '@/core/services/unban/UnbanIdentityService'
import { AUTH_SETTINGS, UNBAN_SETTINGS } from '@/declarations/configurations/settings'
import { ROUTES } from '@/declarations/navigation'
import { MINUTE_SECONDS } from '@/utils/constants/time'

/**
 * Deban. round trip still waiting for its identity
 * @param {string | undefined} packed - Cookie value
 * @return {UnbanTicket | null} - Ticket without an identity
 */

export const readOpenUnban = (packed: string | undefined): UnbanTicket | null => {
  const ticket = unpackUnbanTicket(packed)

  return ticket && !ticket.identity ? ticket : null
}

/**
 * Cookie of a round trip that just left for Discord, short lived
 * @param {string} token - Link the round trip belongs to
 * @return {Promise<void>}
 */

export const openUnbanRoundTrip = async (token: string): Promise<void> => {
  const cookieStore = await cookies()

  cookieStore.set(
    UNBAN_TICKET_COOKIE,
    packUnbanTicket({ token }),
    unbanCookieOptions(AUTH_SETTINGS.stateTtlSeconds)
  )
}

/**
 * Seal the proven identity into the ticket, the Discord access is thrown away by the caller
 * @param {UnbanTicket} open - Ticket of the round trip
 * @param {DiscordIdentity} identity - Account Discord returned
 * @return {Promise<string>} - Public page to come back to
 */

export const completeUnbanSignIn = async (
  open: UnbanTicket,
  identity: DiscordIdentity
): Promise<string> => {
  const proven = await claimUnbanIdentity(open.token, identity)
  const cookieStore = await cookies()

  cookieStore.set(
    UNBAN_TICKET_COOKIE,
    packUnbanTicket({ token: open.token, identity: proven }),
    unbanCookieOptions(UNBAN_SETTINGS.ticketMinutes * MINUTE_SECONDS)
  )

  return ROUTES.unbanPublic(open.token)
}
