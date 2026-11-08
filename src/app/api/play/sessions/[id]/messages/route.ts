import { createProtectedRoute } from '@/core/lib/http/route'
import { listMessages, postMessage } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.PlayAccess,
  descriptor: { summary: 'Read a game chat', tags: ['play'] },
  handler: async ({ params }) => listMessages(params.id),
})

export const POST = createProtectedRoute({
  permission: Permissions.PlayAccess,
  descriptor: { summary: 'Write in a game chat', tags: ['play'] },
  handler: async ({ params, session, raw }) => postMessage(params.id, session.id, raw),
})
