import { createProtectedRoute } from '@/core/lib/http/route'
import { setSeatRole } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.PlayAccess,
  descriptor: { summary: 'Move someone between players and spectators', tags: ['play'] },
  handler: async ({ params, session, raw }) => setSeatRole(params.id, session.id, raw),
})
