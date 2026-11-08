import { createProtectedRoute } from '@/core/lib/http/route'
import { removeShare, viewerOf } from '@/core/services/pages'

export const DELETE = createProtectedRoute({
  descriptor: { summary: 'Withdraw one share', tags: ['pages'] },
  handler: ({ params, session }) => removeShare(params.id, params.shareId ?? '', viewerOf(session)),
})
