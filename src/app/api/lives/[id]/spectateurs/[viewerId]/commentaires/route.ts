import { createProtectedRoute } from '@/core/lib/http/route'
import {
  VIEWER_COMMENT_FIELDS,
  addViewerComment,
  viewerComments,
} from '@/core/services/lives/ViewerCommentService'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.LiveRead,
  descriptor: { summary: 'Read the comments kept on a viewer', tags: ['lives'] },
  handler: async ({ params, scope }) => viewerComments(params.id, params.viewerId, await scope()),
})

export const POST = createProtectedRoute({
  permission: Permissions.LiveModerate,
  status: 201,
  rateLimit: 'moderation',
  fields: VIEWER_COMMENT_FIELDS,
  descriptor: { summary: 'Leave a comment on a viewer', tags: ['lives'] },
  handler: async ({ params, body, session, scope }) =>
    addViewerComment({
      liveId: params.id,
      viewerId: params.viewerId,
      authorId: session.id,
      values: body,
      scope: await scope(),
    }),
})
