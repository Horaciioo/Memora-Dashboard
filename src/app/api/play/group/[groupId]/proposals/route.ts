import { createProtectedRoute } from '@/core/lib/http/route'
import { proposeGroupGame } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.PlayAccess,
  descriptor: { summary: 'Propose a game to the group, or take it back', tags: ['play'] },
  handler: async ({ params, session, raw }) => proposeGroupGame(session.id, params.groupId, raw),
})
