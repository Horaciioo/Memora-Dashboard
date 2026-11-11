import { cookies } from 'next/headers'

import { createProtectedRoute } from '@/core/lib/http/route'
import { requireOwner } from '@/core/wrappers/requireNexus'
import { checkOwnerPassword } from '@/core/services/nexus/NexusAuthService'
import { openPendingSession } from '@/core/services/nexus/NexusSessionService'
import { NEXUS_PATHS } from '@/declarations/nexus/paths'
import { NEXUS_SESSION } from '@/declarations/nexus/settings'
import { cookieName } from '@/utils/constants/cookies'

export const POST = createProtectedRoute({
  rateLimit: 'signIn',
  handler: async (context) => {
    const { host, caller } = await requireOwner(context.session, context.request)

    // First factor
    const rehash = await checkOwnerPassword(
      host.accountId,
      caller,
      context.raw.password,
      'PASSWORD'
    )
    const pending = await openPendingSession(host, caller)

    // Lax so Discord can send the member back with it
    ;(await cookies()).set(cookieName('nexusPending'), pending.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: NEXUS_PATHS.api,
      maxAge: NEXUS_SESSION.pendingSeconds,
    })

    return { next: 'discord', expiresAt: pending.expiresAt.toISOString(), rehash }
  },
})
