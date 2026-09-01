import { cookies } from 'next/headers'

import { INTEGRATION_TICKET_COOKIE, packTicket } from '@/core/lib/auth/integrationTicket'
import { createHandshake, packHandshake } from '@/core/lib/auth/oauthState'
import { OAUTH_STATE_COOKIE } from '@/core/lib/auth/session'
import { createRedirectRoute } from '@/core/lib/http/route'
import { buildAuthorizationUrl } from '@/core/services/auth/DiscordService'
import { resolveInvite } from '@/core/services/onboarding/IntegrationService'
import { AUTH_SETTINGS } from '@/declarations/configurations/settings'
import { ROUTES } from '@/declarations/navigation'
import { integrationFailure } from '@/core/services/onboarding/redirects'

export const GET = createRedirectRoute({
  rateLimit: 'signIn',
  descriptor: { summary: 'Start the Discord identity check of a link', tags: ['integration'] },
  onFailure: integrationFailure,
  handler: async ({ params }) => {
    const { token } = params

    // A dead link never reaches Discord at all
    await resolveInvite(token)

    const handshake = createHandshake()
    const cookieStore = await cookies()

    const shared = {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
      path: ROUTES.home,
    }

    cookieStore.set(OAUTH_STATE_COOKIE, packHandshake(handshake), {
      ...shared,
      maxAge: AUTH_SETTINGS.stateTtlSeconds,
    })

    // The ticket tells the shared callback this round trip answers a link
    cookieStore.set(INTEGRATION_TICKET_COOKIE, packTicket({ token }), {
      ...shared,
      maxAge: AUTH_SETTINGS.stateTtlSeconds,
    })

    return buildAuthorizationUrl(handshake.state, handshake.codeVerifier)
  },
})
