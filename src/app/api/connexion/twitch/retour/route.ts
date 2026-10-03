import { cookies } from 'next/headers'

import { getSession } from '@/core/lib/auth/getSession'
import { matchesToken, unpackHandshake } from '@/core/lib/auth/oauthState'
import { TWITCH_STATE_COOKIE } from '@/core/lib/auth/session'
import { notAuthenticated } from '@/core/lib/errors'
import { createRedirectRoute } from '@/core/lib/http/route'
import { exchangeTwitchCode, readTwitchUser } from '@/core/lib/platforms/twitch/oauth'
import { storeTwitchGrant } from '@/core/services/platforms/PlatformAccountService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { PLATFORM_ACCOUNT_COPY } from '@/declarations/platforms/copy'
import { TWITCH_LINK_RESULT, twitchLinkDestination } from '@/declarations/platforms/link'

export const GET = createRedirectRoute({
  rateLimit: 'signIn',
  descriptor: { summary: 'Finish linking a Twitch moderator account', tags: ['platforms'] },
  onFailure: () => twitchLinkDestination(TWITCH_LINK_RESULT.failed),
  handler: async ({ query }) => {
    const session = await getSession()
    const cookieStore = await cookies()
    const handshake = unpackHandshake(cookieStore.get(TWITCH_STATE_COOKIE)?.value)

    // The handshake is single use whatever happens next
    cookieStore.delete(TWITCH_STATE_COOKIE)

    const code = query.get('code') ?? ''
    if (!session || !handshake || code.length === 0) throw notAuthenticated()
    if (!matchesToken(handshake.state, query.get('state') ?? '')) throw notAuthenticated()

    const grant = await exchangeTwitchCode(code)
    const identity = await readTwitchUser(grant.accessToken)
    await storeTwitchGrant(session.id, grant, identity)

    await recordEvent({
      eventType: 'PlatformLinked',
      actorId: session.id,
      summary: `${PLATFORM_ACCOUNT_COPY.twitch} · ${identity.login}`,
    })

    return twitchLinkDestination(TWITCH_LINK_RESULT.linked)
  },
})
