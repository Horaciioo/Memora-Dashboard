import { createProtectedRoute } from '@/core/lib/http/route'
import { createPlayGroup, readPlayGroup } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.PlayAccess,
  descriptor: { summary: 'Read my play groups and their invitations', tags: ['play'] },
  handler: async ({ session }) => readPlayGroup(session.id),
})

export const POST = createProtectedRoute({
  permission: Permissions.PlayAccess,
  status: 201,
  descriptor: { summary: 'Create a play group', tags: ['play'] },
  handler: async ({ session, raw }) => createPlayGroup(session.id, raw),
})
