import { createProtectedRoute } from '@/core/lib/http/route'
import { markPlayActivitiesRead, readPlayActivities } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.PlayAccess,
  descriptor: { summary: 'Read my Play events', tags: ['play'] },
  handler: async ({ session }) => readPlayActivities(session.id),
})

export const PATCH = createProtectedRoute({
  permission: Permissions.PlayAccess,
  descriptor: { summary: 'Mark my Play events as read', tags: ['play'] },
  handler: async ({ session }) => {
    await markPlayActivitiesRead(session.id)

    return { unread: 0 }
  },
})
