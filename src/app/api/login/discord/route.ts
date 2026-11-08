import { cookies } from 'next/headers'

import { EXERCISE_TICKET_COOKIE } from '@/core/lib/auth/exerciseTicket'
import { IDENTITY_CHECK_COOKIE } from '@/core/lib/auth/identityTicket'
import { INTEGRATION_TICKET_COOKIE } from '@/core/lib/auth/integrationTicket'
import { createHandshake, packHandshake } from '@/core/lib/auth/oauthState'
import { OAUTH_STATE_COOKIE } from '@/core/lib/auth/session'
import { createRedirectRoute } from '@/core/lib/http/route'
import { buildAuthorizationUrl } from '@/core/services/auth/DiscordService'
import { devIdentity, SKIPS_DISCORD } from '@/core/services/auth/devIdentity'
import { resolveDiscordAccount } from '@/core/services/auth/SessionService'
import { checkIdentity, holdCheck } from '@/core/services/identity/signIn'
import { AUTH_SETTINGS } from '@/declarations/configurations/settings'
import { ROUTES } from '@/declarations/navigation'
import { signInFailure } from '@/declarations/access/signIn'

// Query key carrying where the member wanted to land
const RETURN_PARAM = 'suite'

export const GET = createRedirectRoute({
  rateLimit: 'signIn',
  descriptor: { summary: 'Start the Discord sign-in flow', tags: ['auth'] },
  onFailure: signInFailure,
  handler: async ({ query }) => {
    // Only a same-origin path is ever followed back
    const handshake = createHandshake(query.get(RETURN_PARAM) ?? undefined)

    const cookieStore = await cookies()

    // Tests skip Discord, "as" names the identity to play, a made-up one otherwise
    if (SKIPS_DISCORD && query.has('as')) {
      const identity = devIdentity(query.get('as'))
      const checkId = await checkIdentity(identity, await resolveDiscordAccount(identity))
      if (checkId) return holdCheck(checkId)
    }

    // A plain sign-in leaves other flows
    cookieStore.delete(IDENTITY_CHECK_COOKIE)
    cookieStore.delete(EXERCISE_TICKET_COOKIE)
    cookieStore.delete(INTEGRATION_TICKET_COOKIE)
    cookieStore.set(OAUTH_STATE_COOKIE, packHandshake(handshake), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: ROUTES.home,
      maxAge: AUTH_SETTINGS.stateTtlSeconds,
    })

    return buildAuthorizationUrl(handshake.state, handshake.codeVerifier)
  },
})
