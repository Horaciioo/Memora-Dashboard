import { createProtectedRoute } from '@/core/lib/http/route'
import { isOpenLive } from '@/core/lib/lives/permissions'
import { readLive } from '@/core/services/lives/LiveService'
import { beatPresence } from '@/core/services/lives/PresenceService'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.LiveRead,
  descriptor: { summary: 'Count one heartbeat of a Mod View', tags: ['lives'] },
  handler: async ({ params, raw, session, scope }) => {
    // Only an open live of the member's perimeter is counted
    const live = await readLive(params.id, await scope(), session.id, session.permissions)
    if (!isOpenLive(live.status)) return null

    await beatPresence(params.id, session.id, {
      visible: raw.visible === true,
      active: raw.active === true,
      closing: raw.closing === true,
    })

    return null
  },
})
