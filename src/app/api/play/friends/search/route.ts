import { createProtectedRoute } from '@/core/lib/http/route'
import { searchPlayPlayers } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.PlayAccess,
  descriptor: { summary: 'Search players to befriend', tags: ['play'] },
  handler: async ({ query, session }) => searchPlayPlayers(session.id, query.get('q') ?? ''),
})
