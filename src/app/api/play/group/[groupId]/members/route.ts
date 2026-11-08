import { createProtectedRoute } from '@/core/lib/http/route'
import { invitePlayGroup } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.PlayAccess,
  descriptor: { summary: 'Invite members into my play group', tags: ['play'] },
  handler: async ({ params, session, raw }) => invitePlayGroup(session.id, params.groupId, raw),
})
