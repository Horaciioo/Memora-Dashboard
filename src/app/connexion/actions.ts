'use server'

import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { SESSION_COOKIE, isDiscordId, normaliseDiscordId } from '@/core/lib/auth/session'
import { consume, readAddress } from '@/core/lib/http/rateLimit'
import {
  closeSession,
  openSession,
  resolveSignInAccount,
} from '@/core/services/auth/SessionService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { isIdentifierSignInAllowed } from '@/declarations/access/signIn'
import { ROUTES } from '@/declarations/navigation'
import { AUTH_COPY } from '@/declarations/ui/copy/auth'
import { MemberStatuses } from '@/utils/constants/hierarchy'

/**
 * Result of a sign-in attempt
 * @typedef {Object} LoginState
 * @property {string} [error] - Failure message
 */

export interface LoginState {
  error?: string
}

/**
 * Sign in with a Discord identifier, only while Discord itself is unavailable
 * @param {LoginState} _previousState - Previous form state, unused
 * @param {FormData} formData - Submitted identifier
 * @return {Promise<LoginState>} - Failure message or a redirect
 */

export async function login(_previousState: LoginState, formData: FormData): Promise<LoginState> {
  // The fallback is refused outright once Discord is wired, or on a deployed branch
  if (!isIdentifierSignInAllowed()) return { error: AUTH_COPY.identifierDisabled }

  const headerStore = await headers()

  const verdict = await consume('signIn', readAddress(headerStore))
  if (!verdict.allowed) return { error: AUTH_COPY.throttled }

  const discordId = normaliseDiscordId(formData.get('discordId'))

  if (!isDiscordId(discordId)) return { error: AUTH_COPY.malformedId }

  const account = await resolveSignInAccount(discordId)
  if (!account) return { error: AUTH_COPY.unknownId }
  if (account.status === MemberStatuses.Left) return { error: AUTH_COPY.revokedAccess }

  // Session token lands in an httpOnly cookie
  const { token, expiresAt } = await openSession(account.id, {
    userAgent: headerStore.get('user-agent') ?? undefined,
    address: readAddress(headerStore) || undefined,
  })

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: ROUTES.home,
    expires: expiresAt,
  })

  await recordEvent({
    eventType: 'SessionOpened',
    actorId: account.id,
    summary: AUTH_COPY.signedIn,
  })

  redirect(ROUTES.dashboard)
}

/**
 * Clear the session and return to the sign-in screen
 * @return {Promise<never>} - Redirect
 */

export async function logout(): Promise<never> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value

  if (token) await closeSession(token)
  cookieStore.delete(SESSION_COOKIE)

  redirect(ROUTES.login)
}
