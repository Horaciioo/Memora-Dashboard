import { createProtectedRoute } from '@/core/lib/http/route'
import { answerPlayFriend } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.PlayAccess,
  descriptor: { summary: 'Answer a friend request', tags: ['play'] },
  handler: async ({ params, session, raw }) =>
    answerPlayFriend(params.id, session.id, raw.accept === true),
})
