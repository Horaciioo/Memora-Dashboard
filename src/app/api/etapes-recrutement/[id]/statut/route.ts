import { createProtectedRoute } from '@/core/lib/http/route'
import { signalSession } from '@/core/lib/recruitment/signal'
import { setStepDone, stepSession } from '@/core/services/recruitment'
import { JOURNAL_FILES, recordFileEvent } from '@/core/services/system/FileJournal'
import { Permissions } from '@/utils/constants/permissions'

// Whether the step is being cleared or reopened
const DONE_FIELD = 'done'

export const PATCH = createProtectedRoute({
  permission: Permissions.RecruitmentManage,
  descriptor: { summary: 'Clear or reopen a recruitment timeline step', tags: ['recruitment'] },
  handler: async ({ params, raw, session, scope }) => {
    const perimeter = await scope()
    const step = await setStepDone(params.id, raw[DONE_FIELD] === true, perimeter)
    const sessionId = await stepSession(params.id, perimeter)

    await recordFileEvent({
      eventType: 'RecruitmentStepMoved',
      file: JOURNAL_FILES.Recruitment,
      fileId: sessionId,
      actorId: session.id,
      summary: step.title,
    })
    await signalSession(sessionId)

    return step
  },
})
