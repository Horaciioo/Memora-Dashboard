import 'server-only'

import { cookies } from 'next/headers'

import { accessStateOf } from '@/core/lib/unban/linkState'
import { forbidden, notFound, unavailable } from '@/core/lib/errors'
import type { AppError } from '@/core/lib/errors'
import { isExpectedAccount, unpackUnbanTicket } from '@/core/lib/unban/ticket'
import { UNBAN_TICKET_COOKIE } from '@/core/lib/auth/unbanTicket'
import { findLinkByToken } from '@/core/services/unban/links/public'
import type { DiscordIdentity } from '@/core/services/auth/DiscordService'
import { isFeatureOn } from '@/core/services/features/FeatureService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { ROUTES } from '@/declarations/navigation'
import { UNBAN_FAILURE_PARAM, UNBAN_FAILURES } from '@/declarations/unban/failures'
import { ErrorCodes } from '@/utils/constants/errors'
import { UNBAN_INTAKE_FEATURE, UnbanLinkStates } from '@/utils/constants/unban'
import type { PublicLinkRow } from '@/core/services/unban/links/public'
import type { UnbanIdentity } from '@/core/lib/unban/ticket'

// States a Discord sign-in still makes sense in: filing, then following
const SIGN_IN_STATES: string[] = [UnbanLinkStates.Active, UnbanLinkStates.Used]

/**
 * Link a sign-in may start on, a dead one never reaches Discord
 * @param {string} token - Secret from the address
 * @return {Promise<PublicLinkRow>} - Live link
 */

export const resolveSignInLink = async (token: string): Promise<PublicLinkRow> => {
  if (!(await isFeatureOn(UNBAN_INTAKE_FEATURE))) throw unavailable()

  const link = await findLinkByToken(token)
  if (!link || !SIGN_IN_STATES.includes(accessStateOf(link))) throw notFound()

  return link
}

/**
 * Hold the account Discord returned as the one filing
 * @param {string} token - Link the round trip started on
 * @param {DiscordIdentity} identity - Account Discord returned
 * @return {Promise<UnbanIdentity>} - Identity to seal in the ticket
 */

export const claimUnbanIdentity = async (
  token: string,
  identity: DiscordIdentity
): Promise<UnbanIdentity> => {
  const link = await resolveSignInLink(token)

  // A nominative link opens for its account alone
  if (!isExpectedAccount(link.expectedDiscordId, identity.id)) {
    await recordEvent({
      eventType: 'AccessDenied',
      level: 'Warning',
      targetType: 'unbanLink',
      targetId: link.id,
      summary: link.youtuber.name,
    })

    throw forbidden()
  }

  return {
    discordId: identity.id,
    name: identity.globalName ?? identity.username,
    avatar: identity.avatar,
  }
}

/**
 * Destination of a refused identity check
 * @param {AppError} error - Caught failure
 * @param {Record<string, string>} params - Dynamic segments
 * @return {Promise<string>} - Public page of the link
 */

export const unbanFailure = async (
  error: AppError,
  params: Record<string, string>
): Promise<string> => {
  const cookieStore = await cookies()
  const ticket = unpackUnbanTicket(cookieStore.get(UNBAN_TICKET_COOKIE)?.value)
  const token = params.token ?? ticket?.token

  // Without a token there is nowhere to go back to
  if (!token) return ROUTES.login

  const reason =
    error.code === ErrorCodes.InsufficientPermissions
      ? UNBAN_FAILURES.WrongAccount
      : UNBAN_FAILURES.Refused

  return `${ROUTES.unbanPublic(token)}?${UNBAN_FAILURE_PARAM}=${reason}`
}
