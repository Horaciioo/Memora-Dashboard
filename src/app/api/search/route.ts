import { createProtectedRoute } from '@/core/lib/http/route'
import { search } from '@/core/services/search/SearchService'

export const GET = createProtectedRoute({
  rateLimit: 'search',
  descriptor: { summary: 'Global search', tags: ['search'] },
  handler: ({ query, session }) => search(query.get('q') ?? '', session),
})
