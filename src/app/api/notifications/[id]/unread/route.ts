import { createProtectedRoute } from '@/core/lib/http/route'
import { markUnread } from '@/core/services/system/NotificationService'

export const POST = createProtectedRoute({
  descriptor: { summary: 'Mark one notification as unread again', tags: ['notifications'] },
  handler: async ({ params, session }) => {
    await markUnread(params.id, session.id)

    return { id: params.id }
  },
})
