import { createProtectedRoute } from '@/core/lib/http/route'
import { startGroupQuest } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.PlayAccess,
  descriptor: { summary: 'Open a quest for the group', tags: ['play'] },
  handler: async ({ params, session, raw }) => startGroupQuest(session.id, params.groupId, raw),
})
