import { createProtectedRoute } from '@/core/lib/http/route'
import { removeFromGroup } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const DELETE = createProtectedRoute({
  permission: Permissions.PlayAccess,
  descriptor: { summary: 'Remove a member from the play group, or leave it', tags: ['play'] },
  handler: async ({ params, session }) => removeFromGroup(session.id, params.groupId, params.id),
})
