import { createProtectedRoute } from '@/core/lib/http/route'
import {
  SHARED_WORD_FIELDS,
  addSharedWord,
  listSharedWords,
} from '@/core/services/lives/SharedWordService'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.LiveRead,
  descriptor: { summary: 'Read the watch words the team shares', tags: ['lives'] },
  handler: async ({ params, scope }) => listSharedWords(params.id, await scope()),
})

export const POST = createProtectedRoute({
  permission: Permissions.LiveSharedWords,
  status: 201,
  rateLimit: 'moderation',
  fields: SHARED_WORD_FIELDS,
  descriptor: { summary: 'Share a watch word with the team', tags: ['lives'] },
  handler: async ({ params, body, session, scope }) =>
    addSharedWord({
      liveId: params.id,
      authorId: session.id,
      values: body,
      scope: await scope(),
    }),
})
