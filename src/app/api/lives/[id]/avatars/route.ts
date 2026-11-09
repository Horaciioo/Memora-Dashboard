import { createProtectedRoute } from '@/core/lib/http/route'
import { readLiveAvatars } from '@/core/services/lives/AvatarService'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.LiveRead,
  descriptor: { summary: 'Read the profile pictures of chatters', tags: ['lives'] },
  handler: async ({ params, query, session, scope }) =>
    readLiveAvatars(
      params.id,
      await scope(),
      session.id,
      session.permissions,
      (query.get('ids') ?? '').split(',').filter(Boolean)
    ),
})
