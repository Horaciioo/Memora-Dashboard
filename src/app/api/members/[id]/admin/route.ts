import { createProtectedRoute } from '@/core/lib/http/route'
import { readAdminState, resolveActor } from '@/core/services/members/admin'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.MemberUpdate,
  descriptor: { summary: 'Read the heavy gestures state of a moderator', tags: ['members'] },
  handler: async (context) => {
    await resolveActor(context)

    return readAdminState(context.params.id)
  },
})
