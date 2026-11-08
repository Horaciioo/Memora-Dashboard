import { createProtectedRoute } from '@/core/lib/http/route'
import { answerGroupInvite } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.PlayAccess,
  descriptor: { summary: 'Answer a play group invitation', tags: ['play'] },
  handler: async ({ params, session, raw }) =>
    answerGroupInvite(params.id, session.id, raw.accept === true),
})
