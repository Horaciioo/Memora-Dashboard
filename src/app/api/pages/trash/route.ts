import { createProtectedRoute } from '@/core/lib/http/route'
import { listTrash, viewerOf } from '@/core/services/pages'

export const GET = createProtectedRoute({
  descriptor: { summary: 'List the trashed pages the member may restore', tags: ['pages'] },
  handler: ({ session }) => listTrash(viewerOf(session)),
})
