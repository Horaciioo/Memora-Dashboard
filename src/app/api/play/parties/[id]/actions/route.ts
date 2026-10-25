import { createProtectedRoute } from '@/core/lib/http/route'
import { actInSession } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.PlayAccess,
  descriptor: { summary: 'Play one move of a game', tags: ['play'] },
  handler: async ({ params, session, raw }) => actInSession(params.id, session.id, raw),
})
