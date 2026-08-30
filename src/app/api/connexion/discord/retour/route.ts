import { cookies } from 'next/headers'

import { matchesToken, unpackHandshake } from '@/core/lib/auth/oauthState'
import { OAUTH_STATE_COOKIE, SESSION_COOKIE } from '@/core/lib/auth/session'
import { notAuthenticated } from '@/core/lib/errors'
import { readAddress } from '@/core/lib/http/rateLimit'
import { createRedirectRoute } from '@/core/lib/http/route'
import { exchangeCode, readDiscordUser, storeGrant } from '@/core/services/auth/DiscordService'
import { openSession, resolveDiscordAccount } from '@/core/services/auth/SessionService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { SIGN_IN_ERRORS, signInFailure } from '@/declarations/access/signIn'
import { ROUTES } from '@/declarations/navigation'
import { AUTH_COPY } from '@/declarations/ui/copy/auth'
import { MemberStatuses } from '@/utils/constants/hierarchy'

export const GET = createRedirectRoute({
  rateLimit: 'signIn',
  descriptor: { summary: 'Finish the Discord sign-in flow', tags: ['auth'] },
  onFailure: signInFailure,
  handler: async ({ query, request }) => {
    const cookieStore = await cookies()
    const handshake = unpackHandshake(cookieStore.get(OAUTH_STATE_COOKIE)?.value)

    // The handshake is single use whatever happens next
    cookieStore.delete(OAUTH_STATE_COOKIE)

    const code = query.get('code') ?? ''
    const state = query.get('state') ?? ''

    if (!handshake || code.length === 0) throw notAuthenticated(SIGN_IN_ERRORS.Expired)
    if (!matchesToken(handshake.state, state)) throw notAuthenticated(SIGN_IN_ERRORS.Expired)

    const grant = await exchangeCode(code, handshake.codeVerifier)
    const identity = await readDiscordUser(grant.accessToken)

    // Discord proves who they are, the dashboard decides whether they may enter
    const account = await resolveDiscordAccount(identity)
    if (!account) throw notAuthenticated(SIGN_IN_ERRORS.Unknown)
    if (account.status === MemberStatuses.Left) throw notAuthenticated(SIGN_IN_ERRORS.Revoked)

    const { token, expiresAt } = await openSession(account.id, {
      userAgent: request.headers.get('user-agent') ?? undefined,
      address: readAddress(request.headers) || undefined,
    })

    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: ROUTES.home,
      expires: expiresAt,
    })

    await Promise.all([
      storeGrant(account.id, grant),
      recordEvent({
        eventType: 'SessionOpened',
        actorId: account.id,
        summary: AUTH_COPY.signedIn,
      }),
    ])

    return handshake.returnTo ?? ROUTES.dashboard
  },
})
