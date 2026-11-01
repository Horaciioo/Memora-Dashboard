import { createProtectedRoute } from '@/core/lib/http/route'
import { addComment, listComments, viewerOf } from '@/core/services/pages'

export const GET = createProtectedRoute({
  descriptor: { summary: 'Read the comments of a page', tags: ['pages'] },
  handler: ({ params, session }) => listComments(params.id, viewerOf(session)),
})

export const POST = createProtectedRoute({
  status: 201,
  descriptor: { summary: 'Comment a page', tags: ['pages'] },
  handler: ({ params, raw, session }) => addComment(params.id, viewerOf(session), raw),
})
