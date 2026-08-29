import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import { meetingFields, removeMeeting, updateMeeting } from '@/core/services/work/MeetingService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { Permissions } from '@/utils/constants/permissions'

export const PATCH = createProtectedRoute({
  permission: Permissions.MeetingUpdate,
  descriptor: { summary: 'Edit a meeting', tags: ['meetings'] },
  handler: async ({ params, raw, session, scope }) => {
    const parsed = parseFormValues(await meetingFields(await scope()), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    const meeting = await updateMeeting(params.id, parsed.values, await scope(), session.id)

    await recordEvent({
      eventType: 'MeetingUpdated',
      actorId: session.id,
      targetType: 'meeting',
      targetId: meeting.id,
      summary: meeting.title,
    })

    return meeting
  },
})

export const DELETE = createProtectedRoute({
  permission: Permissions.MeetingDelete,
  descriptor: { summary: 'Drop a meeting', tags: ['meetings'] },
  handler: async ({ params, session, scope }) => {
    await removeMeeting(params.id, await scope())

    await recordEvent({
      eventType: 'MeetingDeleted',
      actorId: session.id,
      targetType: 'meeting',
      targetId: params.id,
      summary: params.id,
    })

    return { id: params.id }
  },
})
