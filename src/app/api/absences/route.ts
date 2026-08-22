import { createProtectedRoute } from '@/core/lib/http/route'
import {
  ABSENCE_FIELDS,
  createAbsence,
  listAbsences,
  listOwnAbsences,
} from '@/core/services/absences/AbsenceService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { formatDayRange } from '@/utils/format/dates'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  descriptor: { summary: 'List absences', tags: ['absences'] },
  handler: ({ session, access }) =>
    access.can(Permissions.AbsenceRead) ? listAbsences() : listOwnAbsences(session.id),
})

export const POST = createProtectedRoute({
  permission: Permissions.AbsenceCreate,
  status: 201,
  fields: ABSENCE_FIELDS,
  descriptor: { summary: 'Declare an absence', tags: ['absences'] },
  handler: async ({ body, session }) => {
    const absence = await createAbsence(session.id, body)

    await recordEvent({
      eventType: 'AbsenceRequested',
      actorId: session.id,
      subjectId: session.id,
      targetType: 'absence',
      targetId: absence.id,
      summary: formatDayRange(absence.startDate, absence.endDate),
    })

    return absence
  },
})
