import { forbidden } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { cancelSlot } from '@/core/services/calendar/AnnualSlotService'
import { getEntries } from '@/core/services/calendar/CalendarService'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.CalendarManage,
  descriptor: {
    summary: 'Cancel a taken slot, or move its Moderator elsewhere',
    tags: ['calendar'],
  },
  handler: async ({ params, raw, session, access, scope }) => {
    if (!access.isResponsable) throw forbidden()

    const moveTo = typeof raw.moveTo === 'string' && raw.moveTo !== '' ? raw.moveTo : null
    const changed = await cancelSlot(params.id, moveTo, session.id)

    return getEntries(changed, session.id, access, await scope())
  },
})
