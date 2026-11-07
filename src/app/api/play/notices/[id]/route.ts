import { createProtectedRoute } from '@/core/lib/http/route'
import { closeNotice } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const DELETE = createProtectedRoute({
  permission: Permissions.PlayAccess,
  descriptor: { summary: 'Close a followed game news', tags: ['play'] },
  handler: async ({ params, session }) => closeNotice(params.id, session.id),
})
