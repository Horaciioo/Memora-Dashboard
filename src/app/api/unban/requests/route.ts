import { createProtectedRoute } from '@/core/lib/http/route'
import { parseRequestFilters } from '@/core/lib/unban/requestFilter'
import { unbanCaller } from '@/core/services/unban/caller'
import { listRequests } from '@/core/services/unban/UnbanRequestService'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.UnbanRead,
  rateLimit: 'search',
  descriptor: { summary: 'List the Deban. requests of the perimeter', tags: ['unban'] },
  handler: async (context) =>
    listRequests(parseRequestFilters(context.query), await unbanCaller(context)),
})
