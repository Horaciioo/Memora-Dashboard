import { forbidden } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { assertSeriesInScope, cancelSlot } from '@/core/services/calendar/AnnualSlotService'
import { getEntries } from '@/core/services/calendar/CalendarService'
import { readCalendarScope } from '@/core/services/calendar/visibility'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.CalendarManage,
  descriptor: {
    summary: 'Cancel a taken slot, or move its Moderator elsewhere',
    tags: ['calendar'],
  },
  handler: async ({ params, raw, session, access }) => {
    if (!access.isResponsable) throw forbidden()
    const perimeter = await readCalendarScope(session, access)
    await assertSeriesInScope(params.id, perimeter)

    const moveTo = typeof raw.moveTo === 'string' && raw.moveTo !== '' ? raw.moveTo : null
    const changed = await cancelSlot(params.id, moveTo, session.id)

    return getEntries(changed, session.id, access, perimeter)
  },
})
