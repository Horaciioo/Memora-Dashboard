import { invalidInput } from '@/core/lib/errors'
import { commentFields, parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import { signalSession } from '@/core/lib/recruitment/signal'
import { addSessionComment } from '@/core/services/recruitment/SessionCommentService'
import { notifyMentions } from '@/core/services/system/NotificationService'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.RecruitmentCandidateWrite,
  status: 201,
  descriptor: { summary: 'Leave a remark on a recruitment session', tags: ['recruitment'] },
  handler: async ({ params, raw, session, scope }) => {
    const parsed = parseFormValues(commentFields(), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    const { comments, subject } = await addSessionComment(
      params.id,
      parsed.values,
      session.id,
      await scope()
    )

    await notifyMentions(String(parsed.values.body ?? ''), {
      actorId: session.id,
      target: 'recruitment',
      targetId: params.id,
      subject,
    })

    await signalSession(params.id)

    return comments
  },
})
