import { createProtectedRoute } from '@/core/lib/http/route'
import { reviewTarget, unbanCaller } from '@/core/services/unban/caller'
import { releaseRequest } from '@/core/services/unban/UnbanRequestService'
import { UNBAN_VERSION_FIELD } from '@/declarations/unban/fields'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.UnbanHandle,
  fields: [UNBAN_VERSION_FIELD],
  descriptor: { summary: 'Hand a Deban. request back', tags: ['unban'] },
  handler: async (context) => releaseRequest(reviewTarget(context), await unbanCaller(context)),
})
