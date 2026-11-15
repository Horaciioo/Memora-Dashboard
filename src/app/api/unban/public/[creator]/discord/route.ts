import { cookies } from 'next/headers'

import { EXERCISE_TICKET_COOKIE } from '@/core/lib/auth/exerciseTicket'
import { INTEGRATION_TICKET_COOKIE } from '@/core/lib/auth/integrationTicket'
import { createHandshake, packHandshake } from '@/core/lib/auth/oauthState'
import { OAUTH_STATE_COOKIE } from '@/core/lib/auth/session'
import { unbanCookieOptions } from '@/core/lib/auth/unbanTicket'
import { createRedirectRoute } from '@/core/lib/http/route'
import { buildAuthorizationUrl } from '@/core/services/auth/DiscordService'
import { devIdentity, SKIPS_DISCORD } from '@/core/services/auth/devIdentity'
import { completeUnbanSignIn, openUnbanRoundTrip } from '@/core/services/unban/signIn'
import { resolveSignInCreator, unbanFailure } from '@/core/services/unban/UnbanIdentityService'
import { AUTH_SETTINGS } from '@/declarations/configurations/settings'

export const GET = createRedirectRoute({
  rateLimit: 'signIn',
  descriptor: { summary: 'Start the Discord identity check of a Deban. form', tags: ['unban'] },
  onFailure: unbanFailure,
  handler: async ({ params, query }) => {
    const slug = params.creator

    // An unknown creator never reaches Discord
    await resolveSignInCreator(slug)
    const cookieStore = await cookies()

    // Another link's round trip left behind must not catch this callback
    cookieStore.delete(EXERCISE_TICKET_COOKIE)
    cookieStore.delete(INTEGRATION_TICKET_COOKIE)

    // Tests skip Discord, "as" replays an account, a made-up one otherwise
    if (SKIPS_DISCORD) {
      return completeUnbanSignIn(
        { creator: slug, at: Date.now() },
        devIdentity(query.get('as'))
      )
    }

    const handshake = createHandshake()
    cookieStore.set(OAUTH_STATE_COOKIE, packHandshake(handshake), {
      ...unbanCookieOptions(AUTH_SETTINGS.stateTtlSeconds),
    })
    await openUnbanRoundTrip(slug)

    return buildAuthorizationUrl(handshake.state, handshake.codeVerifier)
  },
})
