import 'server-only'

import { cookies } from 'next/headers'

import type { Account } from '@prisma/client'

import { IDENTITY_CHECK_COOKIE } from '@/core/lib/auth/identityTicket'
import { prisma } from '@/core/lib/db'
import type { DiscordIdentity } from '@/core/services/auth/DiscordService'
import { openCheck } from '@/core/services/identity/IdentityCheckService'
import { findPendingSeat } from '@/core/services/identity/seats'
import { AUTH_SETTINGS } from '@/declarations/configurations/settings'
import { ROUTES } from '@/declarations/navigation'
import { HOUR_SECONDS } from '@/utils/constants/time'

/**
 * Open a check when the identity Discord proved must be verified before anything opens
 * @param {DiscordIdentity} identity - Identity returned by Discord
 * @param {Account | null} account - Account behind it, nobody when unknown
 * @return {Promise<string | null>} - Check identifier, or nothing to check
 */

export const checkIdentity = async (
  identity: DiscordIdentity,
  account: Account | null
): Promise<string | null> => {
  // An accepted candidate confirms who they are before the first session
  if (account) {
    return (await findPendingSeat(account.id)) ? openCheck(identity, account.id) : null
  }

  // A stranger is only heard while a campaign has opened its accounts
  const campaigns = await prisma.recruitmentSession.count({
    where: { accountsActivatedAt: { not: null } },
  })

  return campaigns > 0 ? openCheck(identity, null) : null
}

/**
 * Keep the check in a cookie and name the welcome
 * @param {string} checkId - Check identifier
 * @return {Promise<string>} - Welcome path
 */

export const holdCheck = async (checkId: string): Promise<string> => {
  const cookieStore = await cookies()

  cookieStore.set(IDENTITY_CHECK_COOKIE, checkId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: ROUTES.home,
    maxAge: AUTH_SETTINGS.identityCheckHours * HOUR_SECONDS,
  })

  return ROUTES.welcome
}
