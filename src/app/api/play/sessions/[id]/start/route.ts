import { createProtectedRoute } from '@/core/lib/http/route'
import { startSession } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.PlayAccess,
  descriptor: { summary: 'Launch a game', tags: ['play'] },
  handler: async ({ params, session }) => startSession(params.id, session.id),
})
