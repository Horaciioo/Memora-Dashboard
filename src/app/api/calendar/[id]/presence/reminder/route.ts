import { notFound } from '@/core/lib/errors'
import { prisma } from '@/core/lib/db'
import { createProtectedRoute } from '@/core/lib/http/route'
import { readRosterFor, remindPending } from '@/core/services/calendar/attendance'
import { assertEntriesReachable, calendarViewer } from '@/core/services/calendar/visibility'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.CalendarManage,
  descriptor: { summary: 'Ping the roll-call no-answers now', tags: ['calendar'] },
  handler: async ({ params, session, access }) => {
    const canManage = access.can(Permissions.CalendarManage)
    await assertEntriesReachable([params.id], await calendarViewer(session, access), canManage)

    const event = await prisma.calendarEvent.findUnique({
      where: { id: params.id },
      select: { id: true, title: true, ownerId: true },
    })
    if (!event) throw notFound()

    await remindPending(event, session.id)

    return readRosterFor(params.id, session.id, canManage)
  },
})
