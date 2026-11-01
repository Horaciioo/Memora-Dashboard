import { createProtectedRoute } from '@/core/lib/http/route'
import { savePageContent, viewerOf } from '@/core/services/pages'

export const PUT = createProtectedRoute({
  rateLimit: 'pageSave',
  descriptor: { summary: 'Save the block document of a page', tags: ['pages'] },
  handler: ({ params, raw, session }) =>
    savePageContent(params.id, viewerOf(session), { content: raw.content, baseVersion: raw.baseVersion }),
})
