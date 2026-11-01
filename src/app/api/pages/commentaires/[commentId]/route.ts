import { createProtectedRoute } from '@/core/lib/http/route'
import { deleteComment, resolveComment, viewerOf } from '@/core/services/pages'

export const PATCH = createProtectedRoute({
  descriptor: { summary: 'Resolve or reopen a page comment', tags: ['pages'] },
  handler: ({ params, raw, session }) =>
    resolveComment(params.commentId ?? '', viewerOf(session), raw.resolved === true),
})

export const DELETE = createProtectedRoute({
  descriptor: { summary: 'Delete a page comment', tags: ['pages'] },
  handler: ({ params, session }) => deleteComment(params.commentId ?? '', viewerOf(session)),
})
