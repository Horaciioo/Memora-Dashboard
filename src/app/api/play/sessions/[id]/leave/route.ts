import { createProtectedRoute } from '@/core/lib/http/route'
import { leaveSession } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.PlayAccess,
  descriptor: { summary: 'Leave a game', tags: ['play'] },
  handler: async ({ params, session }) => leaveSession(params.id, session.id),
})
