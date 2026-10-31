import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { readText } from '@/core/lib/forms/values'
import { isHandClosure } from '@/core/lib/recruitment/closure'
import { createProtectedRoute } from '@/core/lib/http/route'
import { signalSession } from '@/core/lib/recruitment/signal'
import {
  readSession,
  removeSession,
  sessionFields,
  updateSession,
} from '@/core/services/recruitment'
import { afterRecruitmentClosed } from '@/core/services/academy/parkour/ParkourService'
import { summariseChange } from '@/core/services/system/changes'
import { recordEvent } from '@/core/services/system/ActivityService'
import { JOURNAL_FILES } from '@/core/services/system/FileJournal'
import { RECRUITMENT_COPY } from '@/declarations/recruitment/copy'
import { Permissions } from '@/utils/constants/permissions'

export const PATCH = createProtectedRoute({
  permission: Permissions.RecruitmentManage,
  descriptor: { summary: 'Edit a recruitment session', tags: ['recruitment'] },
  handler: async ({ params, raw, session, scope }) => {
    const perimeter = await scope()
    const fields = await sessionFields(perimeter)
    const parsed = parseFormValues(fields, raw, { fillMissing: true, enforceRequired: false })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    const before = await readSession(params.id, perimeter)

    // Closing goes through its own route
    if (isHandClosure(readText(parsed.values, 'status') ?? undefined, before.summary.status)) {
      throw invalidInput([{ field: 'status', message: RECRUITMENT_COPY.closeRefused }])
    }
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

    await signalSession(params.id)

    return updated
  },
})

export const DELETE = createProtectedRoute({
  permission: Permissions.RecruitmentManage,
  descriptor: { summary: 'Drop a recruitment session', tags: ['recruitment'] },
  handler: async ({ params, scope }) => removeSession(params.id, await scope()),
})
