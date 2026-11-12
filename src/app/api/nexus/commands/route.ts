import { cookies } from 'next/headers'

import { notAuthenticated } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { runNexusCommand } from '@/core/services/nexus/NexusEngine'
import { findNexusSession, matchesCsrf } from '@/core/services/nexus/NexusSessionService'
import { requireOwner } from '@/core/wrappers/requireNexus'
import { NEXUS_COPY } from '@/declarations/nexus/copy'
import { NEXUS_PATHS } from '@/declarations/nexus/paths'
import { cookieName } from '@/utils/constants/cookies'

export const POST = createProtectedRoute({
  rateLimit: 'nexus',
  handler: async (context) => {
    const { host, caller } = await requireOwner(context.session, context.request)

    // A locked console still answers its one opening command
    const token = (await cookies()).get(cookieName('nexus'))?.value
    const lookup = await findNexusSession(token, host, caller, 'UNLOCKED')
    if (lookup.state === 'reauth') throw notAuthenticated(NEXUS_COPY.reauthNeeded)

    if (
      token &&
      lookup.session &&
      !matchesCsrf(token, context.request.headers.get(NEXUS_PATHS.csrfHeader))
    ) {
      throw notAuthenticated(NEXUS_COPY.locked)
    }

    const { input, confirmToken } = context.raw

    return runNexusCommand({
      input: typeof input === 'string' ? input : '',
      confirmToken: typeof confirmToken === 'string' ? confirmToken : undefined,
      accountId: host.accountId,
      nexus: lookup.session ?? null,
      host,
      caller,
      requestId: crypto.randomUUID(),
    })
  },
})
