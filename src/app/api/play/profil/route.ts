import { createProtectedRoute } from '@/core/lib/http/route'
import { readPlayProfile } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.PlayAccess,
  descriptor: { summary: 'Read my Play levels and stats', tags: ['play'] },
  handler: async ({ session }) => readPlayProfile(session.id),
})
