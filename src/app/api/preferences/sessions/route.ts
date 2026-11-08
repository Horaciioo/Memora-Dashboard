import { cookies } from 'next/headers'

import { SESSION_COOKIE } from '@/core/lib/auth/session'
import { createProtectedRoute } from '@/core/lib/http/route'
import { readSessions, revokeOtherSessions } from '@/core/services/auth/SessionService'

export const GET = createProtectedRoute({
  descriptor: { summary: 'List my open sessions', tags: ['preferences'] },
  handler: async ({ session }) => {
    const token = (await cookies()).get(SESSION_COOKIE)?.value

    return readSessions(session.id, token)
  },
})

export const DELETE = createProtectedRoute({
  descriptor: { summary: 'Close every session but this one', tags: ['preferences'] },
  handler: async ({ session }) => {
    const token = (await cookies()).get(SESSION_COOKIE)?.value ?? ''

    return { revoked: await revokeOtherSessions(session.id, token) }
  },
})
