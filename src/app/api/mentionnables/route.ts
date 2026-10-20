import { createProtectedRoute } from '@/core/lib/http/route'
import { searchMentionable } from '@/core/services/members/MentionService'

export const GET = createProtectedRoute({
  rateLimit: 'search',
  descriptor: { summary: 'Members a remark can name', tags: ['search'] },
  handler: ({ query, session }) => searchMentionable(query.get('q') ?? '', session.id),
})
