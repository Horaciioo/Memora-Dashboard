import { createProtectedRoute } from '@/core/lib/http/route'
import { answerInvite } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.PlayAccess,
  descriptor: { summary: 'Answer a game invitation', tags: ['play'] },
  handler: async ({ params, session, raw }) =>
    answerInvite(params.id, session.id, raw.accept === true),
})
