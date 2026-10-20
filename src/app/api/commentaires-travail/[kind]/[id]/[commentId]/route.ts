import { createProtectedRoute } from '@/core/lib/http/route'
import { commentKind, removeWorkComment } from '@/core/services/work/WorkCommentService'
import { workViewer } from '@/core/services/work/visibility'

export const DELETE = createProtectedRoute({
  descriptor: { summary: 'Drop a remark left on a work record', tags: ['work'] },
  handler: async ({ params, session, access }) =>
    removeWorkComment(
      commentKind(params.kind, access),
      params.id,
      params.commentId,
      workViewer(session, access)
    ),
})
