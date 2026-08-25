import { createProtectedRoute } from '@/core/lib/http/route'
import { reorderQuestions } from '@/core/services/academy/TrainingContentService'
import { Permissions } from '@/utils/constants/permissions'

export const PATCH = createProtectedRoute({
  permission: Permissions.ReferenceManage,
  descriptor: { summary: 'Reorder the questions of a quiz block', tags: ['academy'] },
  handler: ({ params, raw }) =>
    reorderQuestions(params.id, Array.isArray(raw.ids) ? raw.ids.map(String) : []),
})
