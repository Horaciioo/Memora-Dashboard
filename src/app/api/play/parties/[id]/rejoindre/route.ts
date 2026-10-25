import { createProtectedRoute } from '@/core/lib/http/route'
import { joinSession } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.PlayAccess,
  descriptor: { summary: 'Take a seat in a lobby', tags: ['play'] },
  handler: async ({ params, session }) => joinSession(params.id, session.id),
})
