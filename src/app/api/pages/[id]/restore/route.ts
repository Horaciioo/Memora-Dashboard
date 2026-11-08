import { createProtectedRoute } from '@/core/lib/http/route'
import { restorePage, viewerOf } from '@/core/services/pages'

export const POST = createProtectedRoute({
  descriptor: { summary: 'Restore a page from the trash', tags: ['pages'] },
  handler: ({ params, session }) => restorePage(params.id, viewerOf(session)),
})
