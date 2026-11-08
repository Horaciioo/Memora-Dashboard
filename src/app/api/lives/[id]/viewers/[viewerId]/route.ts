import { createProtectedRoute } from '@/core/lib/http/route'
import { viewerSanctions } from '@/core/services/lives/LiveInsightService'
import { readLive } from '@/core/services/lives/LiveService'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.LiveRead,
  descriptor: { summary: 'Read the past sanctions of a viewer', tags: ['lives'] },
  handler: async ({ params, session, scope }) => {
    const perimeter = await scope()
    const live = await readLive(params.id, perimeter, session.id, session.permissions)

    // Colleagues' names show to Responsables and Coordinators only
    const seesAll =
      live.permissions.includes(Permissions.LiveInspect) ||
      live.permissions.includes(Permissions.LiveRoster)

    return viewerSanctions(params.id, params.viewerId, perimeter, {
      readerId: session.id,
      seesAll,
    })
  },
})
