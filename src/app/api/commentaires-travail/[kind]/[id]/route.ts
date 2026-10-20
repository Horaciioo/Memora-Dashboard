import { commentFields } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import {
  addWorkComment,
  commentKind,
  commentMention,
  listWorkComments,
} from '@/core/services/work/WorkCommentService'
import { notifyMentions } from '@/core/services/system/NotificationService'
import { workViewer } from '@/core/services/work/visibility'

export const GET = createProtectedRoute({
  descriptor: { summary: 'Read the remarks left on a work record', tags: ['work'] },
  handler: async ({ params, session, access }) =>
    listWorkComments(commentKind(params.kind, access), params.id, workViewer(session, access)),
})

export const POST = createProtectedRoute({
  status: 201,
  fields: commentFields(),
  descriptor: { summary: 'Leave a remark on a work record', tags: ['work'] },
  handler: async ({ params, body, session, access }) => {
    const kind = commentKind(params.kind, access)
    const comments = await addWorkComment(kind, params.id, workViewer(session, access), body)

    // Members named in the remark hear of it
    const mention = await commentMention(kind, params.id)
    if (mention) await notifyMentions(String(body.body ?? ''), { actorId: session.id, ...mention })

    return comments
  },
})
