import { createProtectedRoute } from '@/core/lib/http/route'
import { reorderChoices } from '@/core/services/academy/TrainingContentService'
import { Permissions } from '@/utils/constants/permissions'

export const PATCH = createProtectedRoute({
  permission: Permissions.ReferenceManage,
  descriptor: { summary: 'Reorder the choices of a quiz question', tags: ['academy'] },
  handler: ({ params, raw }) =>
    reorderChoices(params.id, Array.isArray(raw.ids) ? raw.ids.map(String) : []),
})
