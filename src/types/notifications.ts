import type { NotificationTargetName } from '@/declarations/notifications/targets'
import type { NotificationKindName } from '@/utils/constants/notifications'

/**
 * One notification ready for display
 * @typedef {Object} NotificationEntry
 * @property {string} id - Notification identifier
 * @property {NotificationKindName | null} kind - Nature of the act, unresolved on a retired id
 * @property {string | null} actorName - Who caused it
 * @property {string | null} actorAvatar - Portrait of who caused it
 * @property {NotificationTargetName | null} target - Kind of record it points at
 * @property {string | null} targetId - Record identifier
 * @property {string | null} subject - Title of that record
 * @property {boolean} isRead - Already opened
 * @property {string} createdAt - ISO timestamp
 */

export interface NotificationEntry {
  id: string
  kind: NotificationKindName | null
  actorName: string | null
  actorAvatar: string | null
  target: NotificationTargetName | null
  targetId: string | null
  subject: string | null
  isRead: boolean
  createdAt: string
}

/**
 * One page of notifications and the badge that goes with it
 * @typedef {Object} NotificationFeed
 * @property {NotificationEntry[]} entries - Newest first
 * @property {number} unread - Unopened count
 */

export interface NotificationFeed {
  entries: NotificationEntry[]
  unread: number
}
