import { createProtectedRoute } from '@/core/lib/http/route'
import {
  clearReadNotifications,
  markAllRead,
  readNotifications,
} from '@/core/services/system/NotificationService'
import { NOTIFICATION_SETTINGS } from '@/declarations/configurations/settings'

// Entry count asked by the caller, and the entry a page follows
const SIZE_PARAM = 'taille'
const BEFORE_PARAM = 'apres'

export const GET = createProtectedRoute({
  descriptor: { summary: 'Read my notifications', tags: ['notifications'] },
  handler: async ({ query, session }) => {
    const asked = Number(query.get(SIZE_PARAM))
    const take =
      Number.isInteger(asked) && asked > 0
        ? Math.min(asked, NOTIFICATION_SETTINGS.pageSize)
        : NOTIFICATION_SETTINGS.pageSize

    return readNotifications(session.id, take, query.get(BEFORE_PARAM) ?? undefined)
  },
})

export const PATCH = createProtectedRoute({
  descriptor: { summary: 'Mark every notification as read', tags: ['notifications'] },
  handler: async ({ session }) => {
    await markAllRead(session.id)

    return { unread: 0 }
  },
})

export const DELETE = createProtectedRoute({
  descriptor: { summary: 'Remove the notifications already read', tags: ['notifications'] },
  handler: async ({ session }) => {
    await clearReadNotifications(session.id)

    return { cleared: true }
  },
})
