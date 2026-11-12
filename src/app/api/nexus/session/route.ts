import { cookies } from 'next/headers'

import { createProtectedRoute } from '@/core/lib/http/route'
import { csrfOf, findNexusSession } from '@/core/services/nexus/NexusSessionService'
import { requireOwner } from '@/core/wrappers/requireNexus'
import { cookieName } from '@/utils/constants/cookies'

export const GET = createProtectedRoute({
  handler: async (context) => {
    const { host, caller } = await requireOwner(context.session, context.request)

    const token = (await cookies()).get(cookieName('nexus'))?.value
    const lookup = await findNexusSession(token, host, caller, 'UNLOCKED')
    if (!token || !lookup.session) return { unlocked: false }

    // Armed modes lapse on their own
    const now = new Date()
    const { writeUntil, dangerUntil, expiresAt } = lookup.session

    return {
      unlocked: true,
      reauthRequired: lookup.state === 'reauth',
      csrf: csrfOf(token),
      expiresAt: expiresAt.toISOString(),
      writeUntil: writeUntil && writeUntil > now ? writeUntil.toISOString() : null,
      dangerUntil: dangerUntil && dangerUntil > now ? dangerUntil.toISOString() : null,
    }
  },
})
