import { cookies } from 'next/headers'

import { getSession } from '@/core/lib/auth/getSession'
import { createHandshake, packHandshake } from '@/core/lib/auth/oauthState'
import { ErrorCodes } from '@/utils/constants/errors'
import { createRedirectRoute } from '@/core/lib/http/route'
import { buildAuthorizationUrl } from '@/core/services/auth/DiscordService'
import { assertDiscordOpen, nexusCallbackUri } from '@/core/services/nexus/NexusAuthService'
import { findNexusSession } from '@/core/services/nexus/NexusSessionService'
import { notAuthenticated } from '@/core/lib/errors'
import { requireOwner } from '@/core/wrappers/requireNexus'
import { NEXUS_COPY } from '@/declarations/nexus/copy'
import { NEXUS_PATHS } from '@/declarations/nexus/paths'
import { NEXUS_SESSION } from '@/declarations/nexus/settings'
import { ROUTES } from '@/declarations/navigation'
import { cookieName } from '@/utils/constants/cookies'

export const GET = createRedirectRoute({
  rateLimit: 'signIn',
  onFailure: (error) =>
    error.code === ErrorCodes.ResourceNotFound ? ROUTES.home : `${NEXUS_PATHS.done}?status=refused`,
  handler: async ({ request }) => {
    const { host, caller } = await requireOwner(await getSession(), request)
    const cookieStore = await cookies()

    // The password must have been given a moment ago
    const pending = await findNexusSession(
      cookieStore.get(cookieName('nexusPending'))?.value,
      host,
      caller,
      'PASSWORD'
    )
    if (pending.state !== 'ok') throw notAuthenticated(NEXUS_COPY.locked)

    await assertDiscordOpen(host.accountId, caller)

    // Proof key and state of this attempt only
    const handshake = createHandshake()
    cookieStore.set(cookieName('nexusVerifier'), packHandshake(handshake), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: NEXUS_PATHS.api,
      maxAge: NEXUS_SESSION.pendingSeconds,
    })

    return buildAuthorizationUrl(handshake.state, handshake.codeVerifier, {
      redirectUri: nexusCallbackUri(),
      prompt: 'consent',
    })
  },
})
