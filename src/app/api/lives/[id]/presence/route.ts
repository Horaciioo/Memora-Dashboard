import { createProtectedRoute } from '@/core/lib/http/route'
import { readLive } from '@/core/services/lives/LiveService'
import { beatPresence } from '@/core/services/lives/PresenceService'
import { LiveStatuses } from '@/utils/constants/lives'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.LiveRead,
  descriptor: { summary: 'Count one heartbeat of a Mod View', tags: ['lives'] },
  handler: async ({ params, raw, session, scope }) => {
    // Time only counts from the start of the live to its close, not while preparing
    const live = await readLive(params.id, await scope(), session.id, session.permissions)
    if (live.status !== LiveStatuses.Live) return null

    await beatPresence(params.id, session.id, {
      visible: raw.visible === true,
      active: raw.active === true,
      closing: raw.closing === true,
    })

    return null
  },
})
