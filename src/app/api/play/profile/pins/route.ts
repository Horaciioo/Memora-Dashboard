import { createProtectedRoute } from '@/core/lib/http/route'
import { setPinnedTrophies } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.PlayAccess,
  descriptor: { summary: 'Set the trophies pinned on my profile', tags: ['play'] },
  handler: async ({ session, raw }) => setPinnedTrophies(session.id, raw),
})
