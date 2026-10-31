import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import {
  candidateFields,
  candidateSession,
  removeCandidate,
  updateCandidate,
} from '@/core/services/recruitment'
import { assertInterviewOpen } from '@/core/services/recruitment/InterviewService'
import { JOURNAL_FILES, recordFileEvent } from '@/core/services/system/FileJournal'
import { notify } from '@/core/services/system/NotificationService'
import { RECRUITMENT_COPY } from '@/declarations/recruitment/copy'
import { Permissions } from '@/utils/constants/permissions'

export const PATCH = createProtectedRoute({
  permission: Permissions.RecruitmentCandidateWrite,
  descriptor: { summary: 'Edit a candidate', tags: ['recruitment'] },
  handler: async ({ params, raw, session, scope, access }) => {
    const perimeter = await scope()
    const parsed = parseFormValues(await candidateFields(), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    const viewer = { manage: access.can(Permissions.RecruitmentManage), viewerId: session.id }
    await assertInterviewOpen(params.id, viewer, parsed.values)

    const candidate = await updateCandidate(params.id, parsed.values, perimeter)
    const sessionId = await candidateSession(params.id, perimeter)

    await recordFileEvent({
      eventType: 'CandidateEdited',
      file: JOURNAL_FILES.Recruitment,
      fileId: sessionId,
      actorId: session.id,
      summary: candidate.name,
    })

    await notify({
      kind: 'CandidateAssigned',
      recipients: [candidate.recruiter?.id],
      actorId: session.id,
      target: 'recruitment',
      targetId: sessionId,
      subject: candidate.memberName ?? candidate.discordId,
      once: true,
    })

    return candidate
  },
})

export const DELETE = createProtectedRoute({
  permission: Permissions.RecruitmentManage,
  descriptor: { summary: 'Drop a candidate', tags: ['recruitment'] },
  handler: async ({ params, session, scope }) => {
    const perimeter = await scope()
    const sessionId = await candidateSession(params.id, perimeter)

    await removeCandidate(params.id, perimeter)
    await recordFileEvent({
      eventType: 'CandidateRemoved',
      file: JOURNAL_FILES.Recruitment,
      fileId: sessionId,
      actorId: session.id,
      summary: RECRUITMENT_COPY.logRemoved,
    })
  },
})
