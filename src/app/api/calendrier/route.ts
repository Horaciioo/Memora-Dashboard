import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import {
  assertEntriesAccess,
  calendarFields,
  createEntry,
  listEntries,
  removeEntries,
  updateEntries,
} from '@/core/services/calendar/CalendarService'
import { assertRowsInScope } from '@/core/services/auth/ScopeService'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import { Permissions } from '@/utils/constants/permissions'

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

export const PATCH = createProtectedRoute({
  descriptor: { summary: 'Edit a whole selection at once', tags: ['calendar'] },
  handler: async ({ raw, session, access, scope }) => {
    const perimeter = await scope()
    const ids = readIds(raw)

    await assertEntriesAccess(ids, session.id, access.can(Permissions.CalendarManage))
    await assertRowsInScope('calendarEvent', ids, perimeter)

    // Only the keys actually sent are validated, the rest of every entry stays put
    const parsed = parseFormValues(await calendarFields(perimeter), raw, {
      enforceRequired: false,
    })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    return updateEntries(ids, parsed.values)
  },
})

export const DELETE = createProtectedRoute({
  descriptor: { summary: 'Drop a whole selection at once', tags: ['calendar'] },
  handler: async ({ raw, session, access, scope }) => {
    const ids = readIds(raw)

    await assertEntriesAccess(ids, session.id, access.can(Permissions.CalendarManage))
    await assertRowsInScope('calendarEvent', ids, await scope())
    await removeEntries(ids)

    return { ids }
  },
})
