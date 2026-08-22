import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import { createMeeting, listMeetings, meetingFields } from '@/core/services/work/MeetingService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.MeetingRead,
  descriptor: { summary: 'List meetings', tags: ['meetings'] },
  handler: () => listMeetings(),
})

export const POST = createProtectedRoute({
  permission: Permissions.MeetingCreate,
  status: 201,
  descriptor: { summary: 'Plan a meeting', tags: ['meetings'] },
  handler: async ({ raw, session }) => {
    const parsed = parseFormValues(await meetingFields(), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    const meeting = await createMeeting(parsed.values)

    await recordEvent({
      eventType: 'MeetingScheduled',
      actorId: session.id,
      targetType: 'meeting',
      targetId: meeting.id,
      summary: meeting.title,
    })

    return meeting
  },
})
