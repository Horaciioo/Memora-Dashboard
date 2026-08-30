import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import {
  addComment,
  candidateSession,
  commentFields,
} from '@/core/services/recruitment/RecruitmentService'
import { notifyMentions } from '@/core/services/system/NotificationService'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.RecruitmentCandidateWrite,
  status: 201,
  descriptor: { summary: 'Leave a remark on a candidate', tags: ['recruitment'] },
  handler: async ({ params, raw, session, scope }) => {
    const perimeter = await scope()
    const parsed = parseFormValues(commentFields(), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    const candidate = await addComment(params.id, parsed.values, session.id, perimeter)

    await notifyMentions(String(parsed.values.body ?? ''), {
      actorId: session.id,
      target: 'recruitment',
      targetId: await candidateSession(params.id, perimeter),
      subject: candidate.memberName ?? candidate.discordId,
    })

    return candidate
  },
})
