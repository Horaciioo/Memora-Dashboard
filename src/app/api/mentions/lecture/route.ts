import { invalidInput } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { takeMentionMarks } from '@/core/services/system/NotificationService'
import type { NotificationTargetName } from '@/declarations/notifications/targets'
import { NOTIFICATION_TARGETS } from '@/declarations/notifications/targets'

export const POST = createProtectedRoute({
  descriptor: { summary: 'Take the unseen mentions of an open record', tags: ['notifications'] },
  handler: async ({ raw, session }) => {
    const { target, targetId } = raw
    if (typeof target !== 'string' || !NOTIFICATION_TARGETS.has(target)) throw invalidInput([])
    if (typeof targetId !== 'string' || targetId === '') throw invalidInput([])

    return takeMentionMarks(session.id, target as NotificationTargetName, targetId)
  },
})
