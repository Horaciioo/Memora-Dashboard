import { createProtectedRoute } from '@/core/lib/http/route'
import { requestPlayFriend } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.PlayAccess,
  descriptor: { summary: 'Ask a player to be a friend', tags: ['play'] },
  handler: async ({ session, raw }) => requestPlayFriend(session.id, raw),
})
