import { notFound } from '@/core/lib/errors'
import { prisma } from '@/core/lib/db'
import { createProtectedRoute } from '@/core/lib/http/route'
import { readRosterFor, remindPending } from '@/core/services/calendar/attendance'
import { assertEntryAccess } from '@/core/services/calendar/CalendarService'
import { assertRowInScope } from '@/core/services/auth/ScopeService'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.CalendarRead,
  descriptor: { summary: 'Ping the roll-call no-answers now', tags: ['calendar'] },
  handler: async ({ params, session, access, scope }) => {
    const canManage = access.can(Permissions.CalendarManage)
    await assertEntryAccess(params.id, session.id, canManage)
    await assertRowInScope('calendarEvent', params.id, await scope())

    const event = await prisma.calendarEvent.findUnique({
      where: { id: params.id },
      select: { id: true, title: true, ownerId: true },
    })
    if (!event) throw notFound()

    await remindPending(event)

    return readRosterFor(params.id, session.id, canManage)
  },
})
