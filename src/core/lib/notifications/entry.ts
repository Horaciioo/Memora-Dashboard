import { NOTIFICATION_TARGETS } from '@/declarations/notifications/targets'
import type { NotificationEntry } from '@/types/notifications'
import { NOTIFICATION_KINDS } from '@/utils/constants/notifications'
import type { Prisma } from '@prisma/client'

/**
 * Notification row with its actor
 * @type {Prisma.NotificationGetPayload<object>}
 */

export type NotificationRow = Prisma.NotificationGetPayload<object> & {
  actor: { displayName: string; avatarUrl: string | null } | null
}

/**
 * Map a notification row to its display shape
 * @param {NotificationRow} row - Notification row with its actor
 * @return {NotificationEntry} - Display entry
 */

export const toEntry = (row: NotificationRow): NotificationEntry => {
  // An unknown target kind simply loses its link
  const target = row.targetType ?? ''

  return {
    id: row.id,
    kind: NOTIFICATION_KINDS.byId(row.kind)?.name ?? null,
    actorName: row.actor?.displayName ?? null,
    actorAvatar: row.actor?.avatarUrl ?? null,
    target: NOTIFICATION_TARGETS.has(target) ? target : null,
    targetId: row.targetId,
    subject: row.subject,
    isRead: row.readAt !== null,
    createdAt: row.createdAt.toISOString(),
  }
}
