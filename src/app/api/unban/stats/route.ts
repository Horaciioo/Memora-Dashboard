import { createProtectedRoute } from '@/core/lib/http/route'
import { unbanCaller } from '@/core/services/unban/caller'
import { readOverview } from '@/core/services/unban/UnbanStatsService'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.UnbanRead,
  descriptor: { summary: 'Read the Deban. overview figures', tags: ['unban'] },
  handler: async (context) =>
    readOverview(await unbanCaller(context), context.query.get('youtuberId') ?? undefined),
})
