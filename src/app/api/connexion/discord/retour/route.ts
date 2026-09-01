import { cookies } from 'next/headers'

import {
  INTEGRATION_TICKET_COOKIE,
  packTicket,
  unpackTicket,
} from '@/core/lib/auth/integrationTicket'
import { matchesToken, unpackHandshake } from '@/core/lib/auth/oauthState'
import { OAUTH_STATE_COOKIE, SESSION_COOKIE } from '@/core/lib/auth/session'
import { notAuthenticated } from '@/core/lib/errors'
import { readAddress } from '@/core/lib/http/rateLimit'
import { createRedirectRoute } from '@/core/lib/http/route'
import { exchangeCode, readDiscordUser, storeGrant } from '@/core/services/auth/DiscordService'
import { openSession, resolveDiscordAccount } from '@/core/services/auth/SessionService'
import { claimIdentity } from '@/core/services/onboarding/IntegrationService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { SIGN_IN_ERRORS, signInFailure } from '@/declarations/access/signIn'
import { integrationFailure } from '@/core/services/onboarding/redirects'
import { AUTH_SETTINGS } from '@/declarations/configurations/settings'
import { ROUTES } from '@/declarations/navigation'
import { AUTH_COPY } from '@/declarations/ui/copy/auth'
import { MemberStatuses } from '@/utils/constants/hierarchy'

export const GET = createRedirectRoute({
  rateLimit: 'signIn',
  descriptor: { summary: 'Finish the Discord sign-in flow', tags: ['auth'] },
  onFailure: async (error, params) => {
    // A link's round trip owns its own failure screen, the sign-in page owns the other
    const cookieStore = await cookies()
    const ticket = unpackTicket(cookieStore.get(INTEGRATION_TICKET_COOKIE)?.value)

    return ticket ? integrationFailure(error, params) : signInFailure(error)
  },
  handler: async ({ query, request }) => {
    const cookieStore = await cookies()
    const handshake = unpackHandshake(cookieStore.get(OAUTH_STATE_COOKIE)?.value)
    const ticket = unpackTicket(cookieStore.get(INTEGRATION_TICKET_COOKIE)?.value)

    // The handshake is single use whatever happens next
    cookieStore.delete(OAUTH_STATE_COOKIE)

    const code = query.get('code') ?? ''
    const state = query.get('state') ?? ''

    if (!handshake || code.length === 0) throw notAuthenticated(SIGN_IN_ERRORS.Expired)
    if (!matchesToken(handshake.state, state)) throw notAuthenticated(SIGN_IN_ERRORS.Expired)

    const grant = await exchangeCode(code, handshake.codeVerifier)
    const identity = await readDiscordUser(grant.accessToken)

    // A link only ever needs the identity, it never opens a session
    if (ticket) {
      const claimId = await claimIdentity(ticket.token, identity)

      cookieStore.set(INTEGRATION_TICKET_COOKIE, packTicket({ token: ticket.token, claimId }), {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: ROUTES.home,
        maxAge: AUTH_SETTINGS.stateTtlSeconds,
      })

      return ROUTES.integration(ticket.token)
    }

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
