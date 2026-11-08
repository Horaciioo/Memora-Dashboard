import { createProtectedRoute } from '@/core/lib/http/route'
import { readLive } from '@/core/services/lives/LiveService'
import { stopStint } from '@/core/services/lives/ModStintService'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.LiveRead,
  descriptor: { summary: 'Stop moderating a live', tags: ['lives'] },
  handler: async ({ params, session, scope }) => {
    // Only a live of the member's perimeter
    await readLive(params.id, await scope(), session.id, session.permissions)
    await stopStint(params.id, session.id)

    // A null answer reads as a failure client side
    return { stopped: true }
  },
})
