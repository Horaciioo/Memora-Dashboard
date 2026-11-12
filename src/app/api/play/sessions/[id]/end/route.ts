import { createProtectedRoute } from '@/core/lib/http/route'
import { endSession } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.PlayAccess,
  descriptor: { summary: 'End a started game', tags: ['play'] },
  handler: async ({ params, session }) => endSession(params.id, session.id),
})
