import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import { academyScope } from '@/core/services/academy/AcademyScope'
import {
  calendarFields,
  moveEntry,
  removeEntry,
  resizeEntry,
  updateEntry,
} from '@/core/services/calendar/CalendarService'
import { assertPlannable } from '@/core/services/calendar/academyEntries'
import { assertLiveAccess } from '@/core/services/lives/LiveService'
import { assertEntriesReachable, calendarViewer } from '@/core/services/calendar/visibility'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import { workViewer } from '@/core/services/work/visibility'
import { Permissions } from '@/utils/constants/permissions'

export const PATCH = createProtectedRoute({
  descriptor: { summary: 'Edit or move a calendar entry', tags: ['calendar'] },
  handler: async ({ params, raw, session, access }) => {
    const viewer = await calendarViewer(session, access)
    const perimeter = viewer.scope
    // A trainer reaches their own entries only
    const canManage = access.can(Permissions.CalendarManage) && access.isResponsable
    await assertEntriesReachable([params.id], viewer, canManage)
    const canAnnounceLive = access.can(Permissions.LiveAnnounce)
    await assertLiveAccess({ canAnnounce: canAnnounceLive, entryIds: [params.id] })

    // A lone start only drags the entry
    if (typeof raw.startsAt === 'string' && Object.keys(raw).length === 1) {
      const startsAt = new Date(raw.startsAt)
      if (Number.isNaN(startsAt.getTime())) {
        throw invalidInput([{ field: 'startsAt', message: FORM_COPY.notADate }])
      }

      return moveEntry(params.id, startsAt)
    }

    // A lone end only stretches it
    if (typeof raw.endsAt === 'string' && Object.keys(raw).length === 1) {
      const endsAt = new Date(raw.endsAt)
      if (Number.isNaN(endsAt.getTime())) {
        throw invalidInput([{ field: 'endsAt', message: FORM_COPY.notADate }])
      }

      return resizeEntry(params.id, endsAt)
    }

    const academy = academyScope(session, access)
    const parsed = parseFormValues(
      await calendarFields(
        perimeter,
        workViewer(session, access),
        academy,
        canAnnounceLive,
        access.isResponsable
      ),
      raw,
      { fillMissing: true }
    )
    if (!parsed.ok) throw invalidInput(parsed.issues)
    await assertPlannable(
      typeof parsed.values.templateId === 'string' ? parsed.values.templateId : null,
      access.isResponsable
    )
    await assertLiveAccess({
      canAnnounce: canAnnounceLive,
      templateId: typeof parsed.values.templateId === 'string' ? parsed.values.templateId : null,
    })

    return updateEntry(params.id, parsed.values, perimeter, session.id, canManage, academy)
  },
})

export const DELETE = createProtectedRoute({
  descriptor: { summary: 'Drop a calendar entry', tags: ['calendar'] },
  handler: async ({ params, session, access }) => {
    await assertEntriesReachable(
      [params.id],
      await calendarViewer(session, access),
      access.can(Permissions.CalendarManage) && access.isResponsable
    )
    await assertLiveAccess({
      canAnnounce: access.can(Permissions.LiveAnnounce),
      entryIds: [params.id],
    })
    await removeEntry(params.id)

    return { id: params.id }
  },
})
