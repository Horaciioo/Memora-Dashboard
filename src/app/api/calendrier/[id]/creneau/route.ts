import { forbidden, invalidInput } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import {
  closeSeriesIfComplete,
  placeable,
  placeSlot,
  takeSlot,
} from '@/core/services/calendar/AnnualSlotService'
import { getEntries } from '@/core/services/calendar/CalendarService'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.CalendarManage,
  descriptor: { summary: 'Moderators still to place on a slot', tags: ['calendar'] },
  handler: async ({ params, access }) => {
    if (!access.isResponsable) throw forbidden()

    return placeable(params.id)
  },
})

export const POST = createProtectedRoute({
  permission: Permissions.CalendarRead,
  descriptor: {
    summary: 'Take an open slot of the annual reviews, or place a Moderator on it',
    tags: ['calendar'],
  },
  handler: async ({ params, raw, session, access, scope }) => {
    const placedId = typeof raw.accountId === 'string' ? raw.accountId : null

    let changed: string[]
    if (placedId) {
      // Only a Responsable places someone else
      if (!access.isResponsable || !access.can(Permissions.CalendarManage)) throw forbidden()
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
        await scope()
      ),
      removed,
    }
  },
})
