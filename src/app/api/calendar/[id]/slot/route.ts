import { forbidden, invalidInput } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import {
  assertSeriesInScope,
  closeSeriesIfComplete,
  placeable,
  placeSlot,
  takeSlot,
} from '@/core/services/calendar/AnnualSlotService'
import { getEntries } from '@/core/services/calendar/CalendarService'
import { readCalendarScope } from '@/core/services/calendar/visibility'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.CalendarManage,
  descriptor: { summary: 'Moderators still to place on a slot', tags: ['calendar'] },
  handler: async ({ params, session, access }) => {
    if (!access.isResponsable) throw forbidden()
    await assertSeriesInScope(params.id, await readCalendarScope(session, access))

    return placeable(params.id)
  },
})

export const POST = createProtectedRoute({
  permission: Permissions.CalendarRead,
  descriptor: {
    summary: 'Take an open slot of the annual reviews, or place a Moderator on it',
    tags: ['calendar'],
  },
  handler: async ({ params, raw, session, access }) => {
    const placedId = typeof raw.accountId === 'string' ? raw.accountId : null
    const perimeter = await readCalendarScope(session, access)

    let changed: string[]
    if (placedId) {
      // Only a Responsable places someone else
      if (!access.isResponsable || !access.can(Permissions.CalendarManage)) throw forbidden()
      await assertSeriesInScope(params.id, perimeter)
      changed = await placeSlot(params.id, placedId, session.id)
    } else {
      if (typeof raw.accountId !== 'undefined') {
        throw invalidInput([{ field: 'accountId', message: FORM_COPY.required }])
      }
      changed = await takeSlot(params.id, session.id)
    }

    // Once everyone said they come, the slots nobody took go
    const removed = await closeSeriesIfComplete(params.id)

    return {
      entries: await getEntries(
        changed.filter((id) => !removed.includes(id)),
        session.id,
        access,
        perimeter
      ),
      removed,
    }
  },
})
