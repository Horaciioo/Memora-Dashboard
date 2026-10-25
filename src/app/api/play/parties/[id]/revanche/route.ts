import { createProtectedRoute } from '@/core/lib/http/route'
import { rematchSession } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.PlayAccess,
  status: 201,
  descriptor: { summary: 'Replay a finished game with the same table', tags: ['play'] },
  handler: async ({ params, session }) => rematchSession(params.id, session.id),
})
