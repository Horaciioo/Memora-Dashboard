import { createProtectedRoute } from '@/core/lib/http/route'
import { deleteCategory, updateCategory, viewerOf } from '@/core/services/pages'

export const PATCH = createProtectedRoute({
  descriptor: { summary: 'Rename or reorder a page category', tags: ['pages'] },
  handler: ({ params, raw, session }) => updateCategory(params.id, viewerOf(session), raw),
})

export const DELETE = createProtectedRoute({
  descriptor: { summary: 'Remove a page category, its pages go to the root', tags: ['pages'] },
  handler: async ({ params, session }) => {
    await deleteCategory(params.id, viewerOf(session))

    return { id: params.id }
  },
})
