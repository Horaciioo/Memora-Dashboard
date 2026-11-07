import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import {
  readTopic,
  removeTopic,
  topicFields,
  topicMeetingId,
  touchMeeting,
  updateTopic,
} from '@/core/services/work/MeetingService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { summariseChange } from '@/core/services/system/changes'
import { CHANGE_COPY } from '@/declarations/activity/changes'
import { ACTIVITY_COPY } from '@/declarations/activity/copy'
import { assertMeetingVisible, workViewer } from '@/core/services/work/visibility'
import { Permissions } from '@/utils/constants/permissions'

export const PATCH = createProtectedRoute({
  permission: Permissions.MeetingUpdate,
  descriptor: { summary: 'Edit a meeting topic', tags: ['meetings'] },
  handler: async ({ params, raw, session, access }) => {
    const fields = topicFields()

    const parsed = parseFormValues(fields, raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    const meetingId = await topicMeetingId(params.id)
    await assertMeetingVisible(meetingId, workViewer(session, access))
    const before = await readTopic(params.id)
    const topic = await updateTopic(params.id, parsed.values)
    await touchMeeting(meetingId, session.id)

    await recordEvent({
      eventType: 'MeetingUpdated',
      actorId: session.id,
      targetType: 'meeting',
      targetId: meetingId,
      summary: `${topic.emoji} ${topic.title}`,
      change: summariseChange(fields, before.values, topic.values, {
        context: ACTIVITY_COPY.topicContext.replace('{title}', topic.title),
      }),
    })

    return topic
  },
})

export const DELETE = createProtectedRoute({
  permission: Permissions.MeetingUpdate,
  descriptor: { summary: 'Drop a meeting topic', tags: ['meetings'] },
  handler: async ({ params, session, access }) => {
    const meetingId = await topicMeetingId(params.id)
    await assertMeetingVisible(meetingId, workViewer(session, access))
    const topic = await readTopic(params.id)
    await removeTopic(params.id)
    await touchMeeting(meetingId, session.id)

    await recordEvent({
      eventType: 'MeetingUpdated',
      actorId: session.id,
      targetType: 'meeting',
      targetId: meetingId,
      summary: topic.title,
      change: {
        verb: CHANGE_COPY.verbRemoved,
        rest: ACTIVITY_COPY.topicRemovedRest.replace('{title}', topic.title),
      },
    })

    return { id: params.id }
  },
})
