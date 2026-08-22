import { invalidInput } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { REVIEW_FIELDS, removeAbsence, reviewAbsence } from '@/core/services/absences/AbsenceService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { ABSENCE_STATUS_REGISTRY } from '@/declarations/reference/registries'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import { Permissions } from '@/utils/constants/permissions'
import type { AbsenceStatusName } from '@/utils/constants/workflow'

export const PATCH = createProtectedRoute({
  permission: Permissions.AbsenceReview,
  fields: REVIEW_FIELDS,
  partial: true,
  descriptor: { summary: 'Settle an absence request', tags: ['absences'] },
  handler: async ({ params, raw, body, session }) => {
    const status = String(raw.status ?? '')
    if (!ABSENCE_STATUS_REGISTRY.has(status)) {
      throw invalidInput([{ field: 'status', message: FORM_COPY.notAnOption }])
    }

    const absence = await reviewAbsence(
      params.id,
      status as AbsenceStatusName,
      session.id,
      body
    )

    await recordEvent({
      eventType: 'AbsenceReviewed',
      actorId: session.id,
      subjectId: absence.accountId,
      targetType: 'absence',
      targetId: absence.id,
      summary: ABSENCE_STATUS_REGISTRY.label(status),
    })

    return absence
  },
})

export const DELETE = createProtectedRoute({
  descriptor: { summary: 'Withdraw an absence request', tags: ['absences'] },
  handler: async ({ params, session, access }) => {
    await removeAbsence(params.id, session.id, access.can(Permissions.AbsenceReview))

    return { id: params.id }
  },
})
