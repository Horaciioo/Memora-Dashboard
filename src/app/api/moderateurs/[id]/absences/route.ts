import { createProtectedRoute } from '@/core/lib/http/route'
import { ABSENCE_FIELDS, createAbsence } from '@/core/services/absences/AbsenceService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { formatDayRange } from '@/utils/format/dates'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.AbsenceReview,
  status: 201,
  fields: ABSENCE_FIELDS,
  descriptor: { summary: 'Post an absence for a member', tags: ['absences'] },
  handler: async ({ params, body, session, access }) => {
    const absence = await createAbsence(params.id, body, {
      reviewerId: session.id,
      isAdmin: access.isAdmin,
    })

    await recordEvent({
      eventType: 'AbsenceRequested',
      actorId: session.id,
      subjectId: params.id,
      targetType: 'absence',
      targetId: absence.id,
      summary: formatDayRange(absence.startDate, absence.endDate),
    })

    return absence
  },
})
