import { createProtectedRoute } from '@/core/lib/http/route'
import { unbanCaller } from '@/core/services/unban/caller'
import { readRequest } from '@/core/services/unban/UnbanRequestService'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.UnbanRead,
  descriptor: { summary: 'Read one Deban. request', tags: ['unban'] },
  handler: async (context) => readRequest(context.params.id, await unbanCaller(context)),
})
