import { cookies } from 'next/headers'

import { IDENTITY_CHECK_COOKIE, packWelcomeLink } from '@/core/lib/auth/identityTicket'
import { createHandshake, packHandshake } from '@/core/lib/auth/oauthState'
import { OAUTH_STATE_COOKIE } from '@/core/lib/auth/session'
import { notFound } from '@/core/lib/errors'
import { createRedirectRoute } from '@/core/lib/http/route'
import { prisma } from '@/core/lib/db'
import { buildAuthorizationUrl } from '@/core/services/auth/DiscordService'
import { claimCheckLink } from '@/core/services/identity'
import { devIdentity, SKIPS_DISCORD } from '@/core/services/auth/devIdentity'
import { holdCheck } from '@/core/services/identity/signIn'
import { AUTH_SETTINGS } from '@/declarations/configurations/settings'
import { ROUTES } from '@/declarations/navigation'
import { WELCOME_REFUSED_QUERY } from '@/declarations/onboarding/welcome'
import { IdentityCheckStatuses } from '@/utils/constants/identity'

export const GET = createRedirectRoute({
  rateLimit: 'signIn',
  descriptor: { summary: 'Start the Discord check of a welcome link', tags: ['auth'] },
  onFailure: (_error, params) =>
    `${ROUTES.welcomeLink(params.token ?? '')}?${WELCOME_REFUSED_QUERY}`,
  handler: async ({ params, query }) => {
    const { token } = params

    // A dead link never reaches Discord at all
    const row = await prisma.identityCheck.findUnique({ where: { linkToken: token } })
    if (!row || row.status !== IdentityCheckStatuses.Resolved) throw notFound()

    // Tests skip Discord, "as" names the identity to play
    if (SKIPS_DISCORD && query.has('as')) {
      return holdCheck(await claimCheckLink(token, devIdentity(query.get('as'))))
    }

    const handshake = createHandshake()
    const cookieStore = await cookies()
    const shared = {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
      path: ROUTES.home,
      maxAge: AUTH_SETTINGS.stateTtlSeconds,
    }

    cookieStore.set(OAUTH_STATE_COOKIE, packHandshake(handshake), shared)
    // The shared callback reads this to know the round trip answers a link
    cookieStore.set(IDENTITY_CHECK_COOKIE, packWelcomeLink(token), shared)

    return buildAuthorizationUrl(handshake.state, handshake.codeVerifier)
  },
})
