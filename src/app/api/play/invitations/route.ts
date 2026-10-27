import { createProtectedRoute } from '@/core/lib/http/route'
import { listInvites } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.PlayAccess,
  descriptor: { summary: 'List the game invitations waiting for me', tags: ['play'] },
  handler: async ({ session }) => listInvites(session.id),
})
