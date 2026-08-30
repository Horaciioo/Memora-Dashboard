import { createProtectedRoute } from '@/core/lib/http/route'
import { markRead } from '@/core/services/system/NotificationService'

export const PATCH = createProtectedRoute({
  descriptor: { summary: 'Mark one notification as read', tags: ['notifications'] },
  handler: async ({ params, session }) => {
    await markRead(params.id, session.id)

    return { id: params.id }
  },
})
