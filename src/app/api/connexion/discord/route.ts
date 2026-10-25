import { cookies } from 'next/headers'

import { EXERCISE_TICKET_COOKIE } from '@/core/lib/auth/exerciseTicket'
import { INTEGRATION_TICKET_COOKIE } from '@/core/lib/auth/integrationTicket'
import { createHandshake, packHandshake } from '@/core/lib/auth/oauthState'
import { OAUTH_STATE_COOKIE } from '@/core/lib/auth/session'
import { createRedirectRoute } from '@/core/lib/http/route'
import { buildAuthorizationUrl } from '@/core/services/auth/DiscordService'
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
    // A plain sign-in leaves other flows
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
