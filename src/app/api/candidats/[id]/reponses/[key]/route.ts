import { createProtectedRoute } from '@/core/lib/http/route'
import { signalAnswer } from '@/core/lib/recruitment/signal'
import {
  assertInterviewOpen,
  readAnswerPatch,
  saveAnswer,
} from '@/core/services/recruitment/InterviewService'
import { JOURNAL_FILES, recordFileEvent } from '@/core/services/system/FileJournal'
import { RECRUITMENT_COPY } from '@/declarations/recruitment/copy'
import { Permissions } from '@/utils/constants/permissions'

export const PUT = createProtectedRoute({
  permission: Permissions.RecruitmentCandidateWrite,
  descriptor: { summary: 'Note a question of a candidate interview', tags: ['recruitment'] },
  handler: async ({ params, raw, session, scope, access }) => {
    await assertInterviewOpen(params.id, {
      manage: access.can(Permissions.RecruitmentManage),
      viewerId: session.id,
    })
    const patch = readAnswerPatch(raw)
    const { sessionId, created, answer } = await saveAnswer(params.id, params.key, patch, await scope())
    // Readers first, the journal can wait
    await signalAnswer({ sessionId, candidateId: params.id, key: params.key, answer })

    // Only the first note of a question reaches the journal
    if (created) {
      await recordFileEvent({
        eventType: 'InterviewNoted',
        file: JOURNAL_FILES.Recruitment,
        fileId: sessionId,
        candidateId: params.id,
        actorId: session.id,
        summary: RECRUITMENT_COPY.logNoted,
      })
    }

    return { ok: true }
  },
})
