import { forbidden } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { inspectModerator } from '@/core/services/lives/LiveInsightService'
import { readLive } from '@/core/services/lives/LiveService'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.LiveRead,
  descriptor: { summary: 'Inspect the activity of a moderator on a live', tags: ['lives'] },
  handler: async ({ params, session, scope }) => {
    const perimeter = await scope()
    const live = await readLive(params.id, perimeter, session.id, session.permissions)
    if (!live.permissions.includes(Permissions.LiveInspect)) throw forbidden()

    return inspectModerator(params.id, params.accountId, perimeter)
  },
})
