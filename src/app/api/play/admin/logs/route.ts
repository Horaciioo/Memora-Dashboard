import { createProtectedRoute } from '@/core/lib/http/route'
import { readPlayAdminLogPage } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.PlayManage,
  descriptor: { summary: 'Read a page of the Play journal', tags: ['play'] },
  handler: async ({ query }) => readPlayAdminLogPage(query),
})
