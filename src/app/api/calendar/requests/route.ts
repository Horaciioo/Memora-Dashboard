import { createProtectedRoute } from '@/core/lib/http/route'
import { requestMeeting } from '@/core/services/calendar/MeetingRequestService'
import { MEETING_REQUEST_FIELDS } from '@/declarations/calendar/request'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.CalendarRead,
  fields: MEETING_REQUEST_FIELDS,
  status: 201,
  descriptor: { summary: 'Ask my responsables for a meeting', tags: ['calendar'] },
  handler: async ({ body, session }) => {
    await requestMeeting(session, body)

    return { sent: true }
  },
})
