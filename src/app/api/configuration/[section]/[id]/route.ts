import { conflict, invalidInput, notFound } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { stripRestricted } from '@/core/lib/forms/restrictions'
import { createProtectedRoute } from '@/core/lib/http/route'
import { referenceResource } from '@/core/services/reference/ReferenceService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { REFERENCE_COPY } from '@/declarations/reference/copy'
import { isReferenceKey, referenceSection } from '@/declarations/reference/sections'
import { Permissions } from '@/utils/constants/permissions'

/**
 * Read the section named by the route, or reject
 * @param {Record<string, string>} params - Dynamic segments
 * @return {string} - Collection key
 */

const readSection = (params: Record<string, string>): string => {
  const section = params.section
  if (!isReferenceKey(section)) throw notFound()

  return section
}

export const PATCH = createProtectedRoute({
  permission: Permissions.ReferenceManage,
  descriptor: { summary: 'Edit a reference row', tags: ['reference'] },
  handler: async ({ params, raw, session, access }) => {
    const key = readSection(params)
    const resource = referenceResource(key as never)

    const fields = await resource.fields()
    const parsed = parseFormValues(fields, raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    const row = await resource.update(
      params.id,
      stripRestricted(fields, parsed.values, access.isAdmin)
    )

    await recordEvent({
      eventType: 'ReferenceChanged',
      actorId: session.id,
      targetType: key,
      targetId: row.id,
      summary: `${referenceSection(key)?.singular ?? key} · ${row.label}`,
    })

    return row
  },
})

export const DELETE = createProtectedRoute({
  permission: Permissions.ReferenceManage,
  descriptor: { summary: 'Drop a reference row', tags: ['reference'] },
  handler: async ({ params, session }) => {
    const key = readSection(params)
    const resource = referenceResource(key as never)

    // A row still pointed at by records is never dropped
    const rows = await resource.list()
    const row = rows.find((entry) => entry.id === params.id)
    if (!row) throw notFound()
    if (row.usage > 0) throw conflict(REFERENCE_COPY.inUse)

    await resource.remove(params.id)

    await recordEvent({
      eventType: 'ReferenceChanged',
      actorId: session.id,
      targetType: key,
      targetId: params.id,
      summary: `${referenceSection(key)?.singular ?? key} · ${row.label}`,
    })

    return { id: params.id }
  },
})
