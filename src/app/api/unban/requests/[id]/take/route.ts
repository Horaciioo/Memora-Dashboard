import { createProtectedRoute } from '@/core/lib/http/route'
import { reviewTarget, unbanCaller } from '@/core/services/unban/caller'
import { takeRequest } from '@/core/services/unban/UnbanRequestService'
import { UNBAN_VERSION_FIELD } from '@/declarations/unban/fields'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.UnbanHandle,
  fields: [UNBAN_VERSION_FIELD],
  descriptor: { summary: 'Take a Deban. request in charge', tags: ['unban'] },
  handler: async (context) => takeRequest(reviewTarget(context), await unbanCaller(context)),
})
