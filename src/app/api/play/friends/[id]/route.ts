import { createProtectedRoute } from '@/core/lib/http/route'
import { removePlayFriend } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const DELETE = createProtectedRoute({
  permission: Permissions.PlayAccess,
  descriptor: { summary: 'End a friendship or take a request back', tags: ['play'] },
  handler: async ({ params, session }) => removePlayFriend(session.id, params.id),
})
