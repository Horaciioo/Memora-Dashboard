import { createProtectedRoute } from '@/core/lib/http/route'
import { readText, readRequiredText } from '@/core/lib/forms/values'
import { reviewTarget, unbanCaller } from '@/core/services/unban/caller'
import { decideRequest } from '@/core/services/unban/UnbanRequestService'
import { UNBAN_DECISION_FIELDS } from '@/declarations/unban/fields'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.UnbanHandle,
  fields: UNBAN_DECISION_FIELDS,
  descriptor: { summary: 'Accept or refuse a Deban. request', tags: ['unban'] },
  handler: async (context) =>
    decideRequest(
      reviewTarget(context),
      {
        outcome: readRequiredText(context.body, 'outcome'),
        reviewNote: readText(context.body, 'reviewNote'),
      },
      await unbanCaller(context)
    ),
})
