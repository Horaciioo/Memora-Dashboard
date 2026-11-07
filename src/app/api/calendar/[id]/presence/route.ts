import { invalidInput } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { readHours } from '@/core/lib/calendar/hours'
import { closeSeriesIfComplete } from '@/core/services/calendar/AnnualSlotService'
import { moveOnRollCall, respondToRollCall } from '@/core/services/calendar/attendance'
import { assertEntriesReachable, calendarViewer } from '@/core/services/calendar/visibility'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import { Permissions } from '@/utils/constants/permissions'
import { AttendanceStatuses } from '@/utils/constants/workflow'
import type { AttendanceStatusName } from '@/utils/constants/workflow'

// Answers a member may send
const ANSWERS: AttendanceStatusName[] = [AttendanceStatuses.Present, AttendanceStatuses.Absent]

export const POST = createProtectedRoute({
  permission: Permissions.CalendarRead,
  descriptor: { summary: 'Answer a roll-call', tags: ['calendar'] },
  handler: async ({ params, raw, session, access }) => {
    const status = raw.status
    if (typeof status !== 'string' || !ANSWERS.includes(status as AttendanceStatusName)) {
      throw invalidInput([{ field: 'status', message: FORM_COPY.required }])
    }

    // The convened row authorises the answer, the perimeter does not apply
    const roster = await respondToRollCall({
      eventId: params.id,
      accountId: session.id,
      status: status as AttendanceStatusName,
      canManage: access.can(Permissions.CalendarManage),
      hours: readHours(raw),
    })
    // The last Moderator to say they come closes the slots nobody took
    await closeSeriesIfComplete(params.id)

    return roster
  },
})

export const PATCH = createProtectedRoute({
  permission: Permissions.CalendarManage,
  descriptor: { summary: 'Move a member on a roll-call', tags: ['calendar'] },
  handler: async ({ params, raw, session, access }) => {
    const { accountId, status } = raw
    if (typeof accountId !== 'string' || typeof status !== 'string') {
      throw invalidInput([{ field: 'status', message: FORM_COPY.required }])
    }
    if (!Object.values(AttendanceStatuses).includes(status as AttendanceStatusName)) {
      throw invalidInput([{ field: 'status', message: FORM_COPY.notAnOption }])
    }

    await assertEntriesReachable([params.id], await calendarViewer(session, access), true)

    return moveOnRollCall(params.id, accountId, status as AttendanceStatusName, session.id)
  },
})
