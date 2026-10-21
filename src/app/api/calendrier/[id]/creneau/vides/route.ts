import { forbidden } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { removeOpenSlots } from '@/core/services/calendar/AnnualSlotService'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.CalendarManage,
  descriptor: { summary: 'Remove the slots of a series that nobody took', tags: ['calendar'] },
  handler: async ({ params, access }) => {
    if (!access.isResponsable) throw forbidden()

    return { removed: await removeOpenSlots(params.id) }
  },
})
