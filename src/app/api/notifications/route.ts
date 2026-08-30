import { createProtectedRoute } from '@/core/lib/http/route'
import { markAllRead, readNotifications } from '@/core/services/system/NotificationService'
import { NOTIFICATION_SETTINGS } from '@/declarations/configurations/settings'

// Entry count asked by the caller, the bell reading fewer rows than the full listing
const SIZE_PARAM = 'taille'

export const GET = createProtectedRoute({
  descriptor: { summary: 'Read my notifications', tags: ['notifications'] },
  handler: async ({ query, session }) => {
    const asked = Number(query.get(SIZE_PARAM))
    const take =
      Number.isInteger(asked) && asked > 0
        ? Math.min(asked, NOTIFICATION_SETTINGS.pageSize)
        : NOTIFICATION_SETTINGS.pageSize

    return readNotifications(session.id, take)
  },
})

export const PATCH = createProtectedRoute({
  descriptor: { summary: 'Mark every notification as read', tags: ['notifications'] },
  handler: async ({ session }) => {
    await markAllRead(session.id)

    return { unread: 0 }
  },
})
