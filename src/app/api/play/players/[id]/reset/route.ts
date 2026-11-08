import { createProtectedRoute } from '@/core/lib/http/route'
import { resolveActor } from '@/core/services/members/admin'
import { resetPlayGame } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.PlayManage,
  descriptor: { summary: 'Wipe the Play progression of a moderator on a game', tags: ['play'] },
  handler: async (context) =>
    resetPlayGame(await resolveActor(context), context.params.id, context.raw),
})
