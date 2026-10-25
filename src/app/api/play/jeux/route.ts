import { createProtectedRoute } from '@/core/lib/http/route'
import { readCatalog } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.PlayAccess,
  descriptor: { summary: 'Read the Play games and their choices', tags: ['play'] },
  handler: async () => readCatalog(),
})
