import { createProtectedRoute } from '@/core/lib/http/route'
import { launchGroupGame } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.PlayAccess,
  status: 201,
  descriptor: { summary: 'Open a private table for the group', tags: ['play'] },
  handler: async ({ params, session, raw }) => launchGroupGame(session.id, params.groupId, raw),
})
