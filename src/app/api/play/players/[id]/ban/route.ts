import { createProtectedRoute } from '@/core/lib/http/route'
import { resolveActor } from '@/core/services/members/admin'
import { setPlayBan } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.PlayManage,
  descriptor: { summary: 'Keep a moderator out of Play', tags: ['play'] },
  handler: async (context) =>
    setPlayBan(await resolveActor(context), context.params.id, context.raw),
})
