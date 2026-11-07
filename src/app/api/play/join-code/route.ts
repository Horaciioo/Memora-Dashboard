import { createProtectedRoute } from '@/core/lib/http/route'
import { joinByCode } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.PlayAccess,
  descriptor: { summary: 'Enter a private game with its code', tags: ['play'] },
  handler: async ({ session, raw }) => joinByCode(session.id, raw),
})
