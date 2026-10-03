import { cookies } from 'next/headers'

import { getSession } from '@/core/lib/auth/getSession'
import { createHandshake, packHandshake } from '@/core/lib/auth/oauthState'
import { TWITCH_STATE_COOKIE } from '@/core/lib/auth/session'
import { notAuthenticated } from '@/core/lib/errors'
import { createRedirectRoute } from '@/core/lib/http/route'
import { buildTwitchAuthorizeUrl } from '@/core/lib/platforms/twitch/oauth'
import { AUTH_SETTINGS } from '@/declarations/configurations/settings'
import { ROUTES } from '@/declarations/navigation'
import { TWITCH_LINK_RESULT, twitchLinkDestination } from '@/declarations/platforms/link'

export const GET = createRedirectRoute({
  rateLimit: 'signIn',
  descriptor: { summary: 'Start linking a Twitch moderator account', tags: ['platforms'] },
  onFailure: () => twitchLinkDestination(TWITCH_LINK_RESULT.failed),
  handler: async () => {
    // Only a signed-in member links an account
    const session = await getSession()
    if (!session) throw notAuthenticated()

    const handshake = createHandshake()
    const cookieStore = await cookies()
    cookieStore.set(TWITCH_STATE_COOKIE, packHandshake(handshake), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: ROUTES.home,
      maxAge: AUTH_SETTINGS.stateTtlSeconds,
    })

    return buildTwitchAuthorizeUrl(handshake.state)
  },
})
