import { createProtectedRoute } from '@/core/lib/http/route'
import { resolveActor } from '@/core/services/members/admin'
import { removeFromPlay } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.PlayManage,
  descriptor: { summary: 'Take a moderator out of their Play game', tags: ['play'] },
  handler: async (context) => removeFromPlay(await resolveActor(context), context.params.id),
})
