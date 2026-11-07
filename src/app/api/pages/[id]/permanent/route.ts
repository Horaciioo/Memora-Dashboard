import { createProtectedRoute } from '@/core/lib/http/route'
import { purgePage, viewerOf } from '@/core/services/pages'

export const DELETE = createProtectedRoute({
  descriptor: { summary: 'Erase a trashed page for good', tags: ['pages'] },
  handler: ({ params, session }) => purgePage(params.id, viewerOf(session)),
})
