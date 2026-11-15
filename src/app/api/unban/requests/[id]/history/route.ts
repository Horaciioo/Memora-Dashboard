import { createProtectedRoute } from '@/core/lib/http/route'
import { unbanCaller } from '@/core/services/unban/caller'
import { readHistory } from '@/core/services/unban/UnbanRequestService'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.UnbanRead,
  descriptor: { summary: 'Read the journal of a Deban. request', tags: ['unban'] },
  handler: async (context) => readHistory(context.params.id, await unbanCaller(context)),
})
