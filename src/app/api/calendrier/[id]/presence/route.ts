import { invalidInput } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { respondToRollCall } from '@/core/services/calendar/attendance'
import { assertRowInScope } from '@/core/services/auth/ScopeService'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import { Permissions } from '@/utils/constants/permissions'
import { AttendanceStatuses } from '@/utils/constants/workflow'
import type { AttendanceStatusName } from '@/utils/constants/workflow'

// Answers a member may send, never a plain "no answer"
const ANSWERS: AttendanceStatusName[] = [AttendanceStatuses.Present, AttendanceStatuses.Absent]

export const POST = createProtectedRoute({
  permission: Permissions.CalendarRead,
  descriptor: { summary: 'Answer a roll-call', tags: ['calendar'] },
  handler: async ({ params, raw, session, access, scope }) => {
    const status = raw.status
    if (typeof status !== 'string' || !ANSWERS.includes(status as AttendanceStatusName)) {
      throw invalidInput([{ field: 'status', message: FORM_COPY.required }])
    }

    await assertRowInScope('calendarEvent', params.id, await scope())

    return respondToRollCall(
      params.id,
      session.id,
      status as AttendanceStatusName,
      access.can(Permissions.CalendarManage)
    )
  },
})
