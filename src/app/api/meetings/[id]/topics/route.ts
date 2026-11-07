import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import {
  addTopic,
  listTopics,
  topicFields,
  touchMeeting,
} from '@/core/services/work/MeetingService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { CHANGE_COPY } from '@/declarations/activity/changes'
import { ACTIVITY_COPY } from '@/declarations/activity/copy'
import { notifyMentions } from '@/core/services/system/NotificationService'
import { assertMeetingVisible, workViewer } from '@/core/services/work/visibility'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.MeetingContentRead,
  descriptor: { summary: 'List meeting topics', tags: ['meetings'] },
  handler: async ({ params, session, access }) => {
    await assertMeetingVisible(params.id, workViewer(session, access))

    return listTopics(params.id)
  },
})

export const POST = createProtectedRoute({
  permission: Permissions.MeetingUpdate,
  status: 201,
  descriptor: { summary: 'Open a meeting topic', tags: ['meetings'] },
  handler: async ({ params, raw, session, access }) => {
    await assertMeetingVisible(params.id, workViewer(session, access))

    const parsed = parseFormValues(topicFields(), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    const topic = await addTopic(params.id, parsed.values)
    await touchMeeting(params.id, session.id)

    await recordEvent({
      eventType: 'MeetingUpdated',
      actorId: session.id,
      targetType: 'meeting',
      targetId: params.id,
      summary: `${topic.emoji} ${topic.title}`,
      change: {
        verb: CHANGE_COPY.verbAdded,
        rest: ACTIVITY_COPY.topicAddedRest.replace('{title}', topic.title),
      },
    })

    await notifyMentions(topic.body, {
      actorId: session.id,
      target: 'meeting',
      targetId: params.id,
      subject: topic.title,
    })

    return topic
  },
})
