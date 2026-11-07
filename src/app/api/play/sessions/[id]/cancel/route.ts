import { createProtectedRoute } from '@/core/lib/http/route'
import { cancelSession } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.PlayAccess,
  descriptor: { summary: 'Cancel a lobby', tags: ['play'] },
  handler: async ({ params, session }) => cancelSession(params.id, session.id),
})
