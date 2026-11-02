import { createProtectedRoute } from '@/core/lib/http/route'
import { readRevision, viewerOf } from '@/core/services/pages'

export const GET = createProtectedRoute({
  descriptor: { summary: 'Read one kept version of a page', tags: ['pages'] },
  handler: ({ params, session }) => readRevision(params.id, params.versionId, viewerOf(session)),
})
