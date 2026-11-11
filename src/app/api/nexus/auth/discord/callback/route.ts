import { cookies } from 'next/headers'

import { getSession } from '@/core/lib/auth/getSession'
import { matchesToken, unpackHandshake } from '@/core/lib/auth/oauthState'
import { forbidden, notAuthenticated } from '@/core/lib/errors'
import { createRedirectRoute } from '@/core/lib/http/route'
import { exchangeCode, readDiscordUser } from '@/core/services/auth/DiscordService'
import {
  assertDiscordOpen,
  nexusCallbackUri,
  recordDiscordFailure,
  recordDiscordSuccess,
} from '@/core/services/nexus/NexusAuthService'
import {
  findNexusSession,
  revokeNexusSession,
  unlockNexusSession,
} from '@/core/services/nexus/NexusSessionService'
import { requireOwner } from '@/core/wrappers/requireNexus'
import { NEXUS_COPY } from '@/declarations/nexus/copy'
import { NEXUS_OWNER } from '@/declarations/nexus/owner'
import { NEXUS_PATHS } from '@/declarations/nexus/paths'
import { ROUTES } from '@/declarations/navigation'
import { cookieName } from '@/utils/constants/cookies'
import { ErrorCodes } from '@/utils/constants/errors'

export const GET = createRedirectRoute({
  rateLimit: 'signIn',
  onFailure: (error) =>
    error.code === ErrorCodes.ResourceNotFound ? ROUTES.home : `${NEXUS_PATHS.done}?status=refused`,
  handler: async ({ request, query }) => {
    const session = await getSession()
    const { host, caller } = await requireOwner(session, request)
    const cookieStore = await cookies()

    const pending = await findNexusSession(
      cookieStore.get(cookieName('nexusPending'))?.value,
      host,
      caller,
      'PASSWORD'
    )
    const handshake = unpackHandshake(cookieStore.get(cookieName('nexusVerifier'))?.value)

    // Single use whatever happens next
    cookieStore.delete(cookieName('nexusVerifier'))
    cookieStore.delete(cookieName('nexusPending'))

    if (!pending.session || pending.state !== 'ok' || !handshake) {
      throw notAuthenticated(NEXUS_COPY.locked)
    }

    await assertDiscordOpen(host.accountId, caller)

    try {
      const code = query.get('code') ?? ''
      if (!code || !matchesToken(handshake.state, query.get('state') ?? '')) throw forbidden()

      // The grant is thrown away, only the identity matters
      const grant = await exchangeCode(code, handshake.codeVerifier, nexusCallbackUri())
      const identity = await readDiscordUser(grant.accessToken)

      if (identity.id !== NEXUS_OWNER.discordId || identity.id !== session?.discordId) {
        throw forbidden(NEXUS_COPY.discordRefused)
      }
    } catch (error) {
      await recordDiscordFailure(host.accountId, caller)
      await revokeNexusSession(pending.session.id, 'discord-refused')
      throw error
    }

    // Rotation, the pending token never becomes the console one
    await recordDiscordSuccess(host.accountId, caller)
    const unlocked = await unlockNexusSession(pending.session, host, caller)

    cookieStore.set(cookieName('nexus'), unlocked.token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: NEXUS_PATHS.api,
      expires: unlocked.expiresAt,
    })

    return `${NEXUS_PATHS.done}?status=ok`
  },
})
