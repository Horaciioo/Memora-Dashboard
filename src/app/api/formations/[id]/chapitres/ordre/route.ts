import { createProtectedRoute } from '@/core/lib/http/route'
import { reorderChapters } from '@/core/services/academy/TrainingContentService'
import { Permissions } from '@/utils/constants/permissions'

export const PATCH = createProtectedRoute({
  permission: Permissions.ReferenceManage,
  descriptor: { summary: 'Reorder the chapters of a training', tags: ['academy'] },
  handler: ({ params, raw }) =>
    reorderChapters(params.id, Array.isArray(raw.ids) ? raw.ids.map(String) : []),
})
