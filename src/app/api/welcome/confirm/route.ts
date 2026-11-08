import { cookies } from 'next/headers'

import { IDENTITY_CHECK_COOKIE } from '@/core/lib/auth/identityTicket'
import { notFound } from '@/core/lib/errors'
import { createPublicRoute } from '@/core/lib/http/route'
import { startSession } from '@/core/services/auth/sessionStart'
import { confirmCheck } from '@/core/services/identity'

export const POST = createPublicRoute({
  rateLimit: 'signIn',
  descriptor: {
    summary: 'Confirm the Discord identity of an accepted candidate',
    tags: ['welcome'],
  },
  handler: async ({ request }) => {
    const cookieStore = await cookies()
    const checkId = cookieStore.get(IDENTITY_CHECK_COOKIE)?.value
    if (!checkId) throw notFound()

    const { accountId, sessionName } = await confirmCheck(checkId)

    // The check is spent, the member signs in
    cookieStore.delete(IDENTITY_CHECK_COOKIE)
    await startSession(accountId, request)

    return { sessionName }
  },
})
