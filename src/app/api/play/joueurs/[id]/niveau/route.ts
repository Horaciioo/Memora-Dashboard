import { createProtectedRoute } from '@/core/lib/http/route'
import { resolveActor } from '@/core/services/members/admin'
import { setPlayLevel } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.PlayManage,
  descriptor: { summary: 'Put a moderator at a Play level', tags: ['play'] },
  handler: async (context) =>
    setPlayLevel(await resolveActor(context), context.params.id, context.raw),
})
