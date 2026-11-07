import { createProtectedRoute } from '@/core/lib/http/route'
import { setFollow } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.PlayAccess,
  descriptor: { summary: 'Follow a game or stop following it', tags: ['play'] },
  handler: async ({ params, session, raw }) =>
    setFollow(params.id, session.id, raw.follow !== false),
})
