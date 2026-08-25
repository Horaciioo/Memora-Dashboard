import { createProtectedRoute } from '@/core/lib/http/route'
import { reorderBlocks } from '@/core/services/academy/TrainingContentService'
import { Permissions } from '@/utils/constants/permissions'

export const PATCH = createProtectedRoute({
  permission: Permissions.ReferenceManage,
  descriptor: { summary: 'Reorder the blocks of a chapter', tags: ['academy'] },
  handler: ({ params, raw }) =>
    reorderBlocks(params.id, Array.isArray(raw.ids) ? raw.ids.map(String) : []),
})
