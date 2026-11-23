import { createProtectedRoute } from '@/core/lib/http/route'
import { forbidden } from '@/core/lib/errors'
import { liveGroups } from '@/core/services/lives/LiveAskService'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  descriptor: { summary: 'Who answered what on a live', tags: ['lives'] },
  handler: async ({ params, session, access }) => {
    if (!access.can(Permissions.CalendarManage)) throw forbidden()

    return liveGroups(params.eventId, session.id)
  },
})
