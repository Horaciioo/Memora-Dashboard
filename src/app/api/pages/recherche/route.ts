import { createProtectedRoute } from '@/core/lib/http/route'
import { searchPages, viewerOf } from '@/core/services/pages'

export const GET = createProtectedRoute({
  rateLimit: 'search',
  descriptor: { summary: 'Search the pages the member may open', tags: ['pages'] },
  handler: ({ query, session }) => searchPages(viewerOf(session), query.get('q') ?? ''),
})
