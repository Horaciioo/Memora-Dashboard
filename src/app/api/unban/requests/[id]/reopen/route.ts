import { createProtectedRoute } from '@/core/lib/http/route'
import { readRequiredText } from '@/core/lib/forms/values'
import { reviewTarget, unbanCaller } from '@/core/services/unban/caller'
import { reopenRequest } from '@/core/services/unban/UnbanRequestService'
import { UNBAN_REOPEN_FIELDS } from '@/declarations/unban/fields'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.UnbanManage,
  fields: UNBAN_REOPEN_FIELDS,
  descriptor: { summary: 'Reopen a decided Deban. request', tags: ['unban'] },
  handler: async (context) =>
    reopenRequest(
      reviewTarget(context),
      readRequiredText(context.body, 'reason'),
      await unbanCaller(context)
    ),
})
