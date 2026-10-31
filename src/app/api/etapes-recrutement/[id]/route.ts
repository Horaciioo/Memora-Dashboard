import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import {
  removeStep,
  stepFields,
  stepSession,
  updateStep,
} from '@/core/services/recruitment'
import { JOURNAL_FILES, recordFileEvent } from '@/core/services/system/FileJournal'
import { RECRUITMENT_COPY } from '@/declarations/recruitment/copy'
import { Permissions } from '@/utils/constants/permissions'

export const PATCH = createProtectedRoute({
  permission: Permissions.RecruitmentManage,
  descriptor: { summary: 'Edit a recruitment timeline step', tags: ['recruitment'] },
  handler: async ({ params, raw, session, scope }) => {
    const parsed = parseFormValues(stepFields(), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    const perimeter = await scope()
    const step = await updateStep(params.id, parsed.values, perimeter)

    await recordFileEvent({
      eventType: 'RecruitmentStepMoved',
      file: JOURNAL_FILES.Recruitment,
      fileId: await stepSession(params.id, perimeter),
      actorId: session.id,
      summary: step.title,
    })

    return step
  },
})

export const DELETE = createProtectedRoute({
  permission: Permissions.RecruitmentManage,
  descriptor: { summary: 'Drop a recruitment timeline step', tags: ['recruitment'] },
  handler: async ({ params, session, scope }) => {
    const perimeter = await scope()
    const sessionId = await stepSession(params.id, perimeter)

    await removeStep(params.id, perimeter)
    await recordFileEvent({
      eventType: 'RecruitmentStepMoved',
      file: JOURNAL_FILES.Recruitment,
      fileId: sessionId,
      actorId: session.id,
      summary: RECRUITMENT_COPY.logStepRemoved,
    })
  },
})
