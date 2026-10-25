import { createProtectedRoute } from '@/core/lib/http/route'
import { readLiveStatus } from '@/core/services/lives/LiveService'
import { beatPresence, mayCountTime } from '@/core/services/lives/PresenceService'
import { LiveStatuses } from '@/utils/constants/lives'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.LiveRead,
  descriptor: { summary: 'Count one heartbeat of a Mod View', tags: ['lives'] },
  handler: async ({ params, raw, session, scope }) => {
    // Time only counts from the start of the live to its close, not while preparing
    if ((await readLiveStatus(params.id, await scope())) !== LiveStatuses.Live) return null
    if (!(await mayCountTime(params.id, session))) return null

    await beatPresence(params.id, session.id, {
      visible: raw.visible === true,
      active: raw.active === true,
      closing: raw.closing === true,
    })

    return null
  },
})
