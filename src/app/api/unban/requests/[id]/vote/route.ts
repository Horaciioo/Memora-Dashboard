import { readRequiredText } from '@/core/lib/forms/values'
import { createProtectedRoute } from '@/core/lib/http/route'
import { unbanCaller } from '@/core/services/unban/caller'
import { voteOnRequest } from '@/core/services/unban/UnbanRequestService'
import { UNBAN_VOTE_FIELDS } from '@/declarations/unban/fields'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.UnbanHandle,
  fields: UNBAN_VOTE_FIELDS,
  descriptor: { summary: 'Vote for or against a Deban. request', tags: ['unban'] },
  handler: async (context) =>
    voteOnRequest(
      context.params.id,
      readRequiredText(context.body, 'choice'),
      await unbanCaller(context)
    ),
})
