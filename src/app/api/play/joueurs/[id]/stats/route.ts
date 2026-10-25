import { createProtectedRoute } from '@/core/lib/http/route'
import { resolveActor } from '@/core/services/members/admin'
import { correctPlayStats } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.PlayManage,
  descriptor: { summary: 'Correct the Play record of a moderator', tags: ['play'] },
  handler: async (context) =>
    correctPlayStats(await resolveActor(context), context.params.id, context.raw),
})
