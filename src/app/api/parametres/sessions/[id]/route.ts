import { createProtectedRoute } from '@/core/lib/http/route'
import { revokeSession } from '@/core/services/auth/SessionService'

export const DELETE = createProtectedRoute({
  descriptor: { summary: 'Close one of my sessions', tags: ['preferences'] },
  handler: async ({ params, session }) => {
    await revokeSession(session.id, params.id)

    return { id: params.id }
  },
})
