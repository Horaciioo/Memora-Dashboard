import { createProtectedRoute } from '@/core/lib/http/route'
import { inviteToSession } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.PlayAccess,
  descriptor: { summary: 'Invite players or spectators to a game', tags: ['play'] },
  handler: async ({ params, session, raw }) => inviteToSession(params.id, session.id, raw),
})
