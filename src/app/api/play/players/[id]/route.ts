import { createProtectedRoute } from '@/core/lib/http/route'
import { resolveActor } from '@/core/services/members/admin'
import { readPlayAdmin } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.PlayManage,
  descriptor: { summary: 'Read the Play progression of a moderator', tags: ['play'] },
  handler: async (context) => {
    await resolveActor(context)

    return readPlayAdmin(context.params.id)
  },
})
