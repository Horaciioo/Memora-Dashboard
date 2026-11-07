import { createProtectedRoute } from '@/core/lib/http/route'
import { dissolvePlayGroup, renamePlayGroup } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const PATCH = createProtectedRoute({
  permission: Permissions.PlayAccess,
  descriptor: { summary: 'Rename a play group', tags: ['play'] },
  handler: async ({ params, session, raw }) => renamePlayGroup(session.id, params.groupId, raw),
})

export const DELETE = createProtectedRoute({
  permission: Permissions.PlayAccess,
  descriptor: { summary: 'Dissolve a play group', tags: ['play'] },
  handler: async ({ params, session }) => dissolvePlayGroup(session.id, params.groupId),
})
