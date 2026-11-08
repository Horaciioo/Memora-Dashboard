import 'server-only'

import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'

import { SESSION_COOKIE } from '@/core/lib/auth/session'
import { readAddress } from '@/core/lib/http/rateLimit'
import { openSession } from '@/core/services/auth/SessionService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { ROUTES } from '@/declarations/navigation'
import { AUTH_COPY } from '@/declarations/ui/copy/auth'

/**
 * Open a session and hand its cookie to the browser
 * @param {string} accountId - Account signing in
 * @param {NextRequest} request - Request carrying the origin
 * @return {Promise<void>} - Signed in
 */

export const startSession = async (accountId: string, request: NextRequest): Promise<void> => {
  const { token, expiresAt } = await openSession(accountId, {
    userAgent: request.headers.get('user-agent') ?? undefined,
    address: readAddress(request.headers) || undefined,
  })

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: ROUTES.home,
    expires: expiresAt,
  })

  await recordEvent({ eventType: 'SessionOpened', actorId: accountId, summary: AUTH_COPY.signedIn })
}
