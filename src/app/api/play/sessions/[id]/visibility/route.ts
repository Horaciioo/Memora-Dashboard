import { createProtectedRoute } from '@/core/lib/http/route'
import { setVisibility } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.PlayAccess,
  descriptor: { summary: 'Make a lobby private or public', tags: ['play'] },
  handler: async ({ params, session, raw }) => setVisibility(params.id, session.id, raw),
})
