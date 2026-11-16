import { createProtectedRoute } from '@/core/lib/http/route'
import { readPlayLevels } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.PlayAccess,
  descriptor: { summary: 'Read the Play level of every player', tags: ['play'] },
  handler: async () => readPlayLevels(),
})
