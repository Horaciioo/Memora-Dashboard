import { createProtectedRoute } from '@/core/lib/http/route'
import { readText } from '@/core/lib/forms/values'
import { reviewTarget, unbanCaller } from '@/core/services/unban/caller'
import { assignRequest } from '@/core/services/unban/UnbanRequestService'
import { UNBAN_ASSIGN_FIELDS } from '@/declarations/unban/fields'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.UnbanHandle,
  fields: UNBAN_ASSIGN_FIELDS,
  descriptor: { summary: 'Put a member in charge of a Deban. request', tags: ['unban'] },
  handler: async (context) =>
    assignRequest(
      reviewTarget(context),
      readText(context.body, 'assigneeId'),
      await unbanCaller(context)
    ),
})
