import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import {
  assertEntryAccess,
  calendarFields,
  moveEntry,
  removeEntry,
  updateEntry,
} from '@/core/services/calendar/CalendarService'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import { Permissions } from '@/utils/constants/permissions'

export const PATCH = createProtectedRoute({
  descriptor: { summary: 'Edit or move a calendar entry', tags: ['calendar'] },
  handler: async ({ params, raw, session, access }) => {
    await assertEntryAccess(params.id, session.id, access.can(Permissions.CalendarManage))

    // A lone start only drags the entry, it never rewrites the rest
    if (typeof raw.startsAt === 'string' && Object.keys(raw).length === 1) {
      const startsAt = new Date(raw.startsAt)
      if (Number.isNaN(startsAt.getTime())) {
        throw invalidInput([{ field: 'startsAt', message: FORM_COPY.notADate }])
      }

      return moveEntry(params.id, startsAt)
    }

    const parsed = parseFormValues(await calendarFields(), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    return updateEntry(params.id, parsed.values)
  },
})

export const DELETE = createProtectedRoute({
  descriptor: { summary: 'Drop a calendar entry', tags: ['calendar'] },
  handler: async ({ params, session, access }) => {
    await assertEntryAccess(params.id, session.id, access.can(Permissions.CalendarManage))
    await removeEntry(params.id)

    return { id: params.id }
  },
})
