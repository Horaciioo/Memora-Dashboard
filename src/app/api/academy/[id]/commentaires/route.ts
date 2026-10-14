import { commentFields } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import { academyScope } from '@/core/services/academy/AcademyScope'
import { addSessionComment } from '@/core/services/academy/CommentService'
import { notifyMentions } from '@/core/services/system/NotificationService'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.AcademyNoteWrite,
  status: 201,
  fields: commentFields(),
  descriptor: { summary: 'Leave a remark on a promotion', tags: ['academy'] },
  handler: async ({ params, body, session, access }) => {
    const { comments, sessionId, subject } = await addSessionComment(
      params.id,
      academyScope(session, access),
      session.id,
      body
    )

    await notifyMentions(String(body.body ?? ''), {
      actorId: session.id,
      target: 'junior',
      targetId: sessionId,
      subject,
    })

    return comments
  },
})
