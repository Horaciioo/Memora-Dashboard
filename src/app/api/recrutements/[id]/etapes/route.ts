import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import { createStep, stepFields } from '@/core/services/recruitment/RecruitmentService'
import { JOURNAL_FILES, recordFileEvent } from '@/core/services/system/FileJournal'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.RecruitmentManage,
  status: 201,
  descriptor: { summary: 'Add a step to a session timeline', tags: ['recruitment'] },
  handler: async ({ params, raw, session, scope }) => {
    const parsed = parseFormValues(stepFields(), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    const step = await createStep(params.id, parsed.values, await scope())

    await recordFileEvent({
      eventType: 'RecruitmentStepMoved',
      file: JOURNAL_FILES.Recruitment,
      fileId: params.id,
      actorId: session.id,
      summary: step.title,
    })

    return step
  },
})
