import { createProtectedRoute } from '@/core/lib/http/route'
import { markMentionUnread } from '@/core/services/system/MentionUnreadService'

export const POST = createProtectedRoute({
  descriptor: { summary: 'Mark the mention of a remark as unread', tags: ['notifications'] },
  handler: async ({ params, session }) => {
    await markMentionUnread(params.id, session.id)

    return { done: true }
  },
})
