import { createProtectedRoute } from '@/core/lib/http/route'
import { issueTicket } from '@/core/lib/realtime/server'

export const GET = createProtectedRoute({
  rateLimit: false,
  descriptor: { summary: 'Open a realtime socket ticket', tags: ['system'] },
  handler: async ({ session }) => ({ ticket: issueTicket(session) }),
})
