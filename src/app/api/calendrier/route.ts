import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import { academyScope } from '@/core/services/academy/AcademyScope'
import {
  calendarFields,
  createEntry,
  listEntries,
  removeEntries,
  updateEntries,
} from '@/core/services/calendar/CalendarService'
import { assertPlannable } from '@/core/services/calendar/academyEntries'
import { assertLiveAccess } from '@/core/services/lives/LiveService'
import {
  assertEntriesReachable,
  calendarViewer,
  readCalendarScope,
} from '@/core/services/calendar/visibility'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import { workViewer } from '@/core/services/work/visibility'
import { Permissions } from '@/utils/constants/permissions'

// Template named by a parsed form
const templateOf = (values: Record<string, unknown>): string | null =>
  typeof values.templateId === 'string' ? values.templateId : null

/**
 * Read the selected identifiers off a bulk body
 * @param {Record<string, unknown>} raw - Untouched body
 * @return {string[]} - Selected identifiers
 */

const readIds = (raw: Record<string, unknown>): string[] => {
  const ids = raw.ids
  if (!Array.isArray(ids) || ids.some((id) => typeof id !== 'string') || ids.length === 0) {
    throw invalidInput([{ field: 'ids', message: FORM_COPY.required }])
  }

  return ids as string[]
}

export const GET = createProtectedRoute({
  permission: Permissions.CalendarRead,
  descriptor: { summary: 'Read the calendar window', tags: ['calendar'] },
  handler: async ({ query, session, access, scope }) =>
    listEntries({
      from: new Date(query.get('debut') ?? ''),
      to: new Date(query.get('fin') ?? ''),
      viewerId: session.id,
      access,
      // A session board keeps its own perimeter
      scope: query.get('session') ? await scope() : await readCalendarScope(session, access),
      sessionId: query.get('session') ?? undefined,
    }),
})

export const POST = createProtectedRoute({
  permission: Permissions.CalendarManage,
  idempotent: true,
  status: 201,
  descriptor: { summary: 'Post an entry on the calendar', tags: ['calendar'] },
  handler: async ({ raw, session, access }) => {
    // Same perimeter as the page
    const perimeter = await readCalendarScope(session, access)
    const academy = academyScope(session, access)
    const canAnnounceLive = access.can(Permissions.LiveAnnounce)
    const fields = await calendarFields(
      perimeter,
      workViewer(session, access),
      academy,
      canAnnounceLive,
      access.isResponsable
    )
    const parsed = parseFormValues(fields, raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)
    await assertPlannable(templateOf(parsed.values), access.isResponsable)
    await assertLiveAccess({
      canAnnounce: canAnnounceLive,
      templateId: typeof parsed.values.templateId === 'string' ? parsed.values.templateId : null,
    })

    return createEntry(session.id, parsed.values, perimeter, academy)
  },
})

export const PATCH = createProtectedRoute({
  descriptor: { summary: 'Edit a whole selection at once', tags: ['calendar'] },
  handler: async ({ raw, session, access }) => {
    const viewer = await calendarViewer(session, access)
    const perimeter = viewer.scope
    const ids = readIds(raw)
    const canManage = access.can(Permissions.CalendarManage) && access.isResponsable

    await assertEntriesReachable(ids, viewer, canManage)
    await assertLiveAccess({ canAnnounce: access.can(Permissions.LiveAnnounce), entryIds: ids })

    // Only the keys actually sent are validated
    const academy = academyScope(session, access)
    const parsed = parseFormValues(
      await calendarFields(
        perimeter,
        workViewer(session, access),
        academy,
        access.can(Permissions.LiveAnnounce),
        access.isResponsable
      ),
      raw,
      { enforceRequired: false }
    )
    if (!parsed.ok) throw invalidInput(parsed.issues)
    if ('templateId' in parsed.values) {
      await assertPlannable(templateOf(parsed.values), access.isResponsable)
    }

    return updateEntries(ids, parsed.values, {
      scope: perimeter,
      viewerId: session.id,
      canManage,
      academy,
    })
  },
})

export const DELETE = createProtectedRoute({
  descriptor: { summary: 'Drop a whole selection at once', tags: ['calendar'] },
  handler: async ({ raw, session, access }) => {
    const ids = readIds(raw)

    await assertEntriesReachable(
      ids,
      await calendarViewer(session, access),
      access.can(Permissions.CalendarManage) && access.isResponsable
    )
    await assertLiveAccess({ canAnnounce: access.can(Permissions.LiveAnnounce), entryIds: ids })
    await removeEntries(ids)

    return { ids }
  },
})
