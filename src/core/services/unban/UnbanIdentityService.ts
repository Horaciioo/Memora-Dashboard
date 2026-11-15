import 'server-only'

import { cookies } from 'next/headers'

import { notFound, unavailable } from '@/core/lib/errors'
import type { AppError } from '@/core/lib/errors'
import { unpackUnbanTicket } from '@/core/lib/unban/ticket'
import { UNBAN_TICKET_COOKIE } from '@/core/lib/auth/unbanTicket'
import { findContestCreator } from '@/core/services/unban/contest/creator'
import type { DiscordIdentity } from '@/core/services/auth/DiscordService'
import { isFeatureOn } from '@/core/services/features/FeatureService'
import { ROUTES } from '@/declarations/navigation'
import { UNBAN_FAILURE_PARAM, UNBAN_FAILURES } from '@/declarations/unban/failures'
import { ErrorCodes } from '@/utils/constants/errors'
import { UNBAN_INTAKE_FEATURE } from '@/utils/constants/unban'
import type { IntegrationCreator } from '@/types/onboarding'
import type { UnbanIdentity } from '@/core/lib/unban/ticket'

/**
 * Creator a sign-in may start on, an unknown one never reaches Discord
 * @param {string} slug - Creator segment from the address
 * @return {Promise<IntegrationCreator>} - Creator
 */

export const resolveSignInCreator = async (slug: string): Promise<IntegrationCreator> => {
  if (!(await isFeatureOn(UNBAN_INTAKE_FEATURE))) throw unavailable()

  const creator = await findContestCreator(slug)
  if (!creator) throw notFound()

  return creator
}

/**
 * Hold the account Discord returned as the one filing
 * @param {string} slug - Creator the round trip started on
 * @param {DiscordIdentity} identity - Account Discord returned
 * @return {Promise<UnbanIdentity>} - Identity to seal in the ticket
 */

export const claimUnbanIdentity = async (
  slug: string,
  identity: DiscordIdentity
): Promise<UnbanIdentity> => {
  await resolveSignInCreator(slug)

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
 * @return {Promise<string>} - Public page of the creator
 */

export const unbanFailure = async (
  error: AppError,
  params: Record<string, string>
): Promise<string> => {
  const cookieStore = await cookies()
  const ticket = unpackUnbanTicket(cookieStore.get(UNBAN_TICKET_COOKIE)?.value)
  const slug = params.creator ?? ticket?.creator

  // Without a creator there is nowhere to go back to
  if (!slug) return ROUTES.login

  const reason =
    error.code === ErrorCodes.InsufficientPermissions
      ? UNBAN_FAILURES.WrongAccount
      : UNBAN_FAILURES.Refused

  return `${ROUTES.unbanPublic(slug)}?${UNBAN_FAILURE_PARAM}=${reason}`
}
