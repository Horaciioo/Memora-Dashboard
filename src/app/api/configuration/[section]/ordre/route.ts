import { notFound } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { referenceResource } from '@/core/services/reference/ReferenceService'
import { isReferenceKey } from '@/declarations/reference/sections'
import { Permissions } from '@/utils/constants/permissions'

export const PATCH = createProtectedRoute({
  permission: Permissions.ReferenceManage,
  descriptor: { summary: 'Reorder a reference collection', tags: ['reference'] },
  handler: async ({ params, raw }) => {
    const section = params.section
    if (!isReferenceKey(section)) throw notFound()

    // Identifiers arrive already ordered by the board
    const ids = Array.isArray(raw.ids) ? raw.ids.map(String) : []
    const resource = referenceResource(section)

    await resource.reorder(ids)

    return resource.list()
  },
})
