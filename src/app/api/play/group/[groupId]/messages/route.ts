import { createProtectedRoute } from '@/core/lib/http/route'
import { sendGroupMessage } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.PlayAccess,
  status: 201,
  descriptor: { summary: 'Write in the chat of a play group', tags: ['play'] },
  handler: async ({ params, session, raw }) => sendGroupMessage(session.id, params.groupId, raw),
})
