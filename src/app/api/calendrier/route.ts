import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import { calendarFields, createEntry, listEntries } from '@/core/services/calendar/CalendarService'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.CalendarRead,
  descriptor: { summary: 'Read the calendar window', tags: ['calendar'] },
  handler: async ({ query, session, access, scope }) =>
    listEntries({
      from: new Date(query.get('debut') ?? ''),
      to: new Date(query.get('fin') ?? ''),
      viewerId: session.id,
      access,
      scope: await scope(),
      sessionId: query.get('session') ?? undefined,
    }),
})

export const POST = createProtectedRoute({
  permission: Permissions.CalendarManage,
  status: 201,
  descriptor: { summary: 'Post an entry on the calendar', tags: ['calendar'] },
  handler: async ({ raw, session, scope }) => {
    const parsed = parseFormValues(await calendarFields(await scope()), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    return createEntry(session.id, parsed.values)
  },
})
