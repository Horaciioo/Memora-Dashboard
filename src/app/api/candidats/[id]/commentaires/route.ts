import { invalidInput } from '@/core/lib/errors'
import { commentFields, parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import { signalCandidate } from '@/core/lib/recruitment/signal'
import { addComment, candidateSession } from '@/core/services/recruitment'
import { notifyMentions } from '@/core/services/system/NotificationService'
import { JOURNAL_FILES, recordFileEvent } from '@/core/services/system/FileJournal'
import { RECRUITMENT_COPY } from '@/declarations/recruitment/copy'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.RecruitmentCandidateWrite,
  status: 201,
  descriptor: { summary: 'Leave a remark on a candidate', tags: ['recruitment'] },
  handler: async ({ params, raw, session, scope }) => {
    const perimeter = await scope()
    const parsed = parseFormValues(commentFields(), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    const questionKey = typeof raw.questionKey === 'string' ? raw.questionKey : null
    const candidate = await addComment(params.id, parsed.values, session.id, perimeter, questionKey)

    await notifyMentions(String(parsed.values.body ?? ''), {
      actorId: session.id,
      target: 'recruitment',
      targetId: await candidateSession(params.id, perimeter),
      subject: candidate.memberName ?? candidate.discordId,
    })

    if (questionKey) {
      await recordFileEvent({
        eventType: 'QuestionCommented',
        file: JOURNAL_FILES.Recruitment,
        fileId: await candidateSession(params.id, perimeter),
        candidateId: params.id,
        actorId: session.id,
        summary: RECRUITMENT_COPY.logCommented,
      })
    }

    await signalCandidate(params.id)

    return candidate
  },
})
