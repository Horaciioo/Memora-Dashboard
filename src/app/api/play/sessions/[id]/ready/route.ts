import { createProtectedRoute } from '@/core/lib/http/route'
import { setReady } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.PlayAccess,
  descriptor: { summary: 'Say ready in a lobby', tags: ['play'] },
  handler: async ({ params, session, raw }) => setReady(params.id, session.id, raw),
})
