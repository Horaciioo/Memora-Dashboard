import { commentFields } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import { academyScope } from '@/core/services/academy/AcademyScope'
import { addJuniorComment } from '@/core/services/academy/CommentService'
import { notifyMentions } from '@/core/services/system/NotificationService'
import { juniorTargetId } from '@/declarations/notifications/targets'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.AcademyNoteWrite,
  status: 201,
  fields: commentFields(),
  descriptor: { summary: 'Leave a remark on a junior', tags: ['academy'] },
  handler: async ({ params, body, session, access }) => {
    const { comments, sessionId, subject } = await addJuniorComment(
      params.id,
      academyScope(session, access),
      session.id,
      body
    )

    await notifyMentions(String(body.body ?? ''), {
      actorId: session.id,
      target: 'junior',
      targetId: juniorTargetId(sessionId, params.id),
      subject,
    })

    return comments
  },
})
