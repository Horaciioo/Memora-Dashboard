import { createProtectedRoute } from '@/core/lib/http/route'
import { readFlag } from '@/core/lib/forms/values'
import {
  commentKind,
  pinWorkComment,
  removeWorkComment,
} from '@/core/services/work/WorkCommentService'
import { workViewer } from '@/core/services/work/visibility'

export const DELETE = createProtectedRoute({
  descriptor: { summary: 'Drop a remark left on a work record', tags: ['work'] },
  handler: async ({ params, session, access, scope }) =>
    removeWorkComment(
      commentKind(params.kind, access),
      params.id,
      params.commentId,
      workViewer(session, access),
      scope
    ),
})

export const PATCH = createProtectedRoute({
  fields: [{ name: 'pinned', kind: 'toggle', label: 'Épinglée' }],
  descriptor: { summary: 'Pin or unpin a remark left on a work record', tags: ['work'] },
  handler: async ({ params, body, session, access, scope }) =>
    pinWorkComment(
      commentKind(params.kind, access),
      params.id,
      params.commentId,
      readFlag(body, 'pinned'),
      workViewer(session, access),
      scope
    ),
})
