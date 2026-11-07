import { createProtectedRoute } from '@/core/lib/http/route'
import { voteInLobby } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.PlayAccess,
  descriptor: { summary: 'Vote on the format and course before launch', tags: ['play'] },
  handler: async ({ params, session, raw }) => voteInLobby(params.id, session.id, raw),
})
