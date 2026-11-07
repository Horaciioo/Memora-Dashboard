import { createProtectedRoute } from '@/core/lib/http/route'
import { restoreRevision, viewerOf } from '@/core/services/pages'

export const POST = createProtectedRoute({
  descriptor: { summary: 'Bring a kept version back as a new one', tags: ['pages'] },
  handler: ({ params, session }) => restoreRevision(params.id, params.versionId, viewerOf(session)),
})
