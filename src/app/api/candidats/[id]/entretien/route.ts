import { createProtectedRoute } from '@/core/lib/http/route'
import { signalCandidate } from '@/core/lib/recruitment/signal'
import { readCandidate } from '@/core/services/recruitment/CandidateService'
import { readInterviewPatch, saveInterview } from '@/core/services/recruitment/InterviewService'
import { JOURNAL_FILES, recordFileEvent } from '@/core/services/system/FileJournal'
import { RECRUITMENT_COPY } from '@/declarations/recruitment/copy'
import type { EventTypeName } from '@/utils/constants/events'
import { Permissions } from '@/utils/constants/permissions'

export const PUT = createProtectedRoute({
  permission: Permissions.RecruitmentCandidateWrite,
  descriptor: {
    summary: 'Set the register, the start or the verdict of an interview',
    tags: ['recruitment'],
  },
  handler: async ({ params, raw, scope, session }) => {
    const patch = readInterviewPatch(raw)
    const { sessionId } = await saveInterview(params.id, patch, await scope())

    // One line per moment changed
    const events: [EventTypeName, string][] = []
    if (patch.started) events.push(['InterviewStarted', RECRUITMENT_COPY.logStarted])
    if (patch.verdictOutcomeId !== undefined) {
      events.push([
        'VerdictGiven',
        patch.verdictOutcomeId ? RECRUITMENT_COPY.logVerdict : RECRUITMENT_COPY.logVerdictCleared,
      ])
    }
    if (patch.formal !== undefined) {
      events.push([
        'RegisterSwitched',
        patch.formal ? RECRUITMENT_COPY.logFormal : RECRUITMENT_COPY.logInformal,
      ])
    }
    for (const [eventType, summary] of events) {
      await recordFileEvent({
        eventType,
        file: JOURNAL_FILES.Recruitment,
        fileId: sessionId,
        candidateId: params.id,
        actorId: session.id,
        summary,
      })
    }

    await signalCandidate(params.id, sessionId)

    return readCandidate(params.id)
  },
})
