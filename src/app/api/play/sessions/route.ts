import { createProtectedRoute } from '@/core/lib/http/route'
import { createSession, listLobbies } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.PlayAccess,
  descriptor: { summary: 'List the open lobbies and my current game', tags: ['play'] },
  handler: async ({ session, query, access }) =>
    listLobbies(session.id, query.get('game'), access.can(Permissions.PlayManage)),
})

export const POST = createProtectedRoute({
  permission: Permissions.PlayAccess,
  status: 201,
  descriptor: { summary: 'Open a lobby or a tournament', tags: ['play'] },
  handler: async ({ session, raw, access }) => createSession(session.id, raw, access.isSystem),
})
