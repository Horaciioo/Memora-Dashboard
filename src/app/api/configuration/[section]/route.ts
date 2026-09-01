import { invalidInput, notFound } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { stripRestricted } from '@/core/lib/forms/restrictions'
import { createProtectedRoute } from '@/core/lib/http/route'
import { referenceResource } from '@/core/services/reference/ReferenceService'
import { recordEvent } from '@/core/services/system/ActivityService'
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

export const GET = createProtectedRoute({
  permission: Permissions.ReferenceRead,
  descriptor: { summary: 'List a reference collection', tags: ['reference'] },
  handler: async ({ params }) => {
    const key = readSection(params)
    const resource = referenceResource(key as never)

    return { fields: await resource.fields(), rows: await resource.list() }
  },
})

export const POST = createProtectedRoute({
  permission: Permissions.ReferenceManage,
  status: 201,
  descriptor: { summary: 'Add a reference row', tags: ['reference'] },
  handler: async ({ params, raw, session, access }) => {
    const key = readSection(params)
    const resource = referenceResource(key as never)

    // Declarations are resolved per section, so parsing happens here
    const fields = await resource.fields()
    const parsed = parseFormValues(fields, raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    const row = await resource.create(stripRestricted(fields, parsed.values, access.isAdmin))

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
