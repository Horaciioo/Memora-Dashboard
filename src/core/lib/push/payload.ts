import { NOTIFICATION_KIND_REGISTRY } from '@/declarations/notifications/registries'
import { ROUTES } from '@/declarations/navigation'
import { PWA_ICONS } from '@/declarations/pwa/manifest'
import type { NotificationEntry } from '@/types/notifications'
import type { PushPayload } from '@/declarations/pwa/worker'
import { notificationHref, notificationText } from '@/utils/format/notifications'

// Between kind and subject
const TITLE_JOINT = ' · '

/**
 * First line of a push
 * @param {NotificationEntry} entry - Notification
 * @return {string} - Title
 */

const titleOf = (entry: NotificationEntry): string => {
  const kind = entry.kind ? NOTIFICATION_KIND_REGISTRY.get(entry.kind) : null
  if (!kind) return entry.subject ?? ''

  // An addressed sentence already carries the subject
  return entry.subject && !kind.addressed
    ? `${kind.label}${TITLE_JOINT}${entry.subject}`
    : kind.label
}

/**
 * Turn a notification into what the service worker draws
 * @param {Object} input - Push source
 * @param {NotificationEntry} input.entry - Notification
 * @param {number} input.unread - Badge count
 * @param {string | null} input.readUrl - Marks it read
 * @return {PushPayload | null} - Payload or nothing for an unknown kind
 */

export const buildPushPayload = ({
  entry,
  unread,
  readUrl,
}: {
  entry: NotificationEntry
  unread: number
  readUrl: string | null
}): PushPayload | null => {
  const body = notificationText(entry)
  if (!body) return null

  return {
    tag: entry.id,
    title: titleOf(entry),
    body,
    url: notificationHref(entry) ?? ROUTES.notifications,
    readUrl,
    notificationId: readUrl ? entry.id : null,
    unread,
    icon: PWA_ICONS.small,
    badge: PWA_ICONS.badge,
    at: entry.createdAt,
  }
}
