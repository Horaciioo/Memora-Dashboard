import { forbidden } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { assertSeriesInScope, removeOpenSlots } from '@/core/services/calendar/AnnualSlotService'
import { readCalendarScope } from '@/core/services/calendar/visibility'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.CalendarManage,
  descriptor: { summary: 'Remove the slots of a series that nobody took', tags: ['calendar'] },
  handler: async ({ params, session, access }) => {
    if (!access.isResponsable) throw forbidden()
    await assertSeriesInScope(params.id, await readCalendarScope(session, access))

    return { removed: await removeOpenSlots(params.id) }
  },
})
