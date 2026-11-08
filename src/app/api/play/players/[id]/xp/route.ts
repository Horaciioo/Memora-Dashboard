import { createProtectedRoute } from '@/core/lib/http/route'
import { resolveActor } from '@/core/services/members/admin'
import { adjustPlayXp } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.PlayManage,
  descriptor: { summary: 'Give or take Play XP from a moderator', tags: ['play'] },
  handler: async (context) =>
    adjustPlayXp(await resolveActor(context), context.params.id, context.raw),
})
