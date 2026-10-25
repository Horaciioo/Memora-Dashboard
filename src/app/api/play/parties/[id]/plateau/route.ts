import { createProtectedRoute } from '@/core/lib/http/route'
import { readBoard } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.PlayAccess,
  descriptor: { summary: 'Read the board of a running game', tags: ['play'] },
  handler: async ({ params, session }) => readBoard(params.id, session.id),
})
