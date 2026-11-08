import { createProtectedRoute } from '@/core/lib/http/route'
import { listNotices } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.PlayAccess,
  descriptor: { summary: 'List the game news waiting for me', tags: ['play'] },
  handler: async ({ session }) => listNotices(session.id),
})
