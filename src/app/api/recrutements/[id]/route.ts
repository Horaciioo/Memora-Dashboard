import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import {
  readSession,
  removeSession,
  sessionFields,
  updateSession,
} from '@/core/services/recruitment/RecruitmentService'
import { afterRecruitmentClosed } from '@/core/services/academy/ParkourService'
import { summariseChange } from '@/core/services/system/changes'
import { recordEvent } from '@/core/services/system/ActivityService'
import { JOURNAL_FILES } from '@/core/services/system/FileJournal'
import { Permissions } from '@/utils/constants/permissions'

export const PATCH = createProtectedRoute({
  permission: Permissions.RecruitmentManage,
  descriptor: { summary: 'Edit a recruitment session', tags: ['recruitment'] },
  handler: async ({ params, raw, session, scope }) => {
    const perimeter = await scope()
    const fields = await sessionFields(perimeter)
    const parsed = parseFormValues(fields, raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    const before = await readSession(params.id, perimeter)
    const updated = await updateSession(params.id, parsed.values, perimeter)

    await recordEvent({
      eventType: 'RecruitmentEdited',
      actorId: session.id,
      targetType: JOURNAL_FILES.Recruitment,
      targetId: updated.id,
      summary: updated.name,
      change: summariseChange(fields, before.summary.values, updated.values),
    })

    // A campaign that ends frees the promotion it feeds
    if (updated.status !== before.summary.status) await afterRecruitmentClosed(updated.id)

    return updated
  },
})

export const DELETE = createProtectedRoute({
  permission: Permissions.RecruitmentManage,
  descriptor: { summary: 'Drop a recruitment session', tags: ['recruitment'] },
  handler: async ({ params, scope }) => removeSession(params.id, await scope()),
})
