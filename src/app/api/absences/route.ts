import { createProtectedRoute } from '@/core/lib/http/route'
import {
  ABSENCE_FIELDS,
  createAbsence,
  listOwnAbsences,
  listReviewQueue,
} from '@/core/services/absences/AbsenceService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { formatDayRange } from '@/utils/format/dates'
import { Permissions } from '@/utils/constants/permissions'
import type { MemberAbsence } from '@/types/members'

export const GET = createProtectedRoute({
  descriptor: { summary: 'List absences', tags: ['absences'] },
  handler: async ({ session, access }): Promise<MemberAbsence[]> => {
    const mine = await listOwnAbsences(session.id)
    if (!access.can(Permissions.AbsenceRead)) return mine

    const queue = await listReviewQueue(session.id, access.isAdmin)
    const seen = new Set(mine.map((absence) => absence.id))

    return [...mine, ...queue.filter((absence) => !seen.has(absence.id))]
  },
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
