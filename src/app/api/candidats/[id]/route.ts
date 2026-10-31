import { forbidden, invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import { signalCandidate, signalCandidateRemoved } from '@/core/lib/recruitment/signal'
import {
  candidateFields,
  candidateSession,
  observerIdsOf,
  recruiterIdsOf,
  removeCandidate,
  updateCandidate,
} from '@/core/services/recruitment'
import { recruitmentModeOf } from '@/core/services/recruitment/access'
import { readCandidate } from '@/core/services/recruitment/CandidateService'
import { maskForObserver } from '@/core/services/recruitment/ObserverMask'
import { candidateSessionId } from '@/core/services/recruitment/reach'
import { assertInterviewOpen } from '@/core/services/recruitment/InterviewService'
import { JOURNAL_FILES, recordFileEvent } from '@/core/services/system/FileJournal'
import { notify } from '@/core/services/system/NotificationService'
import { RECRUITMENT_COPY } from '@/declarations/recruitment/copy'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  descriptor: { summary: 'Read a candidate as the session shows it', tags: ['recruitment'] },
  handler: async ({ params, session, scope, access }) => {
    const mode = await recruitmentModeOf(access, session.id, await candidateSessionId(params.id))
    if (!mode) throw forbidden()
    // A reader stays inside their perimeter
    if (mode === 'read') await candidateSession(params.id, await scope())

    const candidate = await readCandidate(params.id)

    return mode === 'observe' ? maskForObserver(candidate) : candidate
  },
})

export const PATCH = createProtectedRoute({
  permission: Permissions.RecruitmentCandidateWrite,
  descriptor: { summary: 'Edit a candidate', tags: ['recruitment'] },
  handler: async ({ params, raw, session, scope, access }) => {
    const perimeter = await scope()
    const parsed = parseFormValues(
      await candidateFields(undefined, await observerIdsOf(params.id)),
      raw,
      { fillMissing: true }
    )
    if (!parsed.ok) throw invalidInput(parsed.issues)

    const before = await recruiterIdsOf(params.id)

    const viewer = { manage: access.can(Permissions.RecruitmentManage), viewerId: session.id }
    await assertInterviewOpen(params.id, viewer, parsed.values)

    const candidate = await updateCandidate(params.id, parsed.values, perimeter)
    const sessionId = await candidateSession(params.id, perimeter)

    await recordFileEvent({
      eventType: 'CandidateEdited',
      file: JOURNAL_FILES.Recruitment,
      fileId: sessionId,
      candidateId: params.id,
      actorId: session.id,
      summary: candidate.name,
    })

    await notify({
      kind: 'CandidateAssigned',
      // Only the recruiters just put on the interview hear about it
      recipients: candidate.recruiters.map((seat) => seat.id).filter((id) => !before.includes(id)),
      actorId: session.id,
      target: 'recruitment',
      targetId: sessionId,
      subject: candidate.memberName ?? candidate.discordId,
      once: true,
    })

    await signalCandidate(params.id, sessionId)

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
    await signalCandidateRemoved(sessionId, params.id)
  },
})
