import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import {
  meetingFields,
  readMeeting,
  removeMeeting,
  updateMeeting,
} from '@/core/services/work/MeetingService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { summariseChange } from '@/core/services/system/changes'
import { notify } from '@/core/services/system/NotificationService'
import { Permissions } from '@/utils/constants/permissions'

export const PATCH = createProtectedRoute({
  permission: Permissions.MeetingUpdate,
  descriptor: { summary: 'Edit a meeting', tags: ['meetings'] },
  handler: async ({ params, raw, session, scope }) => {
    const perimeter = await scope()
    const fields = await meetingFields(perimeter)

    const parsed = parseFormValues(fields, raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    const before = await readMeeting(params.id)
    const meeting = await updateMeeting(params.id, parsed.values, perimeter, session.id)

    await recordEvent({
      eventType: 'MeetingUpdated',
      actorId: session.id,
      targetType: 'meeting',
      targetId: meeting.id,
      summary: meeting.title,
      change: summariseChange(fields, before.summary.values, meeting.values),
    })

    await notify({
      kind: 'MeetingInvited',
      recipients: [...meeting.leads, ...meeting.assistants, ...meeting.participants].map(
        (person) => person.id
      ),
      actorId: session.id,
      target: 'meeting',
      targetId: meeting.id,
      subject: meeting.title,
      once: true,
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
