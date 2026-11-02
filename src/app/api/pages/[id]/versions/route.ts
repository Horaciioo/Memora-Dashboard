import { createProtectedRoute } from '@/core/lib/http/route'
import { listRevisions, viewerOf } from '@/core/services/pages'

export const GET = createProtectedRoute({
  descriptor: { summary: 'List the kept versions of a page', tags: ['pages'] },
  handler: ({ params, session }) => listRevisions(params.id, viewerOf(session)),
})
