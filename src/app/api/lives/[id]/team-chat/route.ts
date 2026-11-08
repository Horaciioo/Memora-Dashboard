import { createProtectedRoute } from '@/core/lib/http/route'
import { listTeamMessages } from '@/core/services/lives/TeamChatService'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.LiveRead,
  descriptor: { summary: 'Read the internal chat of a live', tags: ['lives'] },
  handler: async ({ params, query, session }) =>
    listTeamMessages(params.id, session, query.get('cursor')),
})
