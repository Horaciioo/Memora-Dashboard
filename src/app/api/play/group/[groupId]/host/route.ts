import { createProtectedRoute } from '@/core/lib/http/route'
import { transferPlayGroup } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.PlayAccess,
  descriptor: { summary: 'Hand my play group over to another member', tags: ['play'] },
  handler: async ({ params, session, raw }) => transferPlayGroup(session.id, params.groupId, raw),
})
