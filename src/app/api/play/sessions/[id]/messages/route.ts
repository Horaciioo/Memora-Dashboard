import { createProtectedRoute } from '@/core/lib/http/route'
import { postMessage, readMessages } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.PlayAccess,
  descriptor: { summary: 'Read a game chat', tags: ['play'] },
  handler: async ({ params, session, access }) =>
    readMessages(params.id, session.id, access.can(Permissions.PlayManage)),
})

export const POST = createProtectedRoute({
  permission: Permissions.PlayAccess,
  descriptor: { summary: 'Write in a game chat', tags: ['play'] },
  handler: async ({ params, session, raw }) => postMessage(params.id, session.id, raw),
})
