import { createProtectedRoute } from '@/core/lib/http/route'
import { dropGroupProposal } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const DELETE = createProtectedRoute({
  permission: Permissions.PlayAccess,
  descriptor: { summary: 'Drop a game proposal', tags: ['play'] },
  handler: async ({ params, session }) => dropGroupProposal(session.id, params.groupId, params.id),
})
