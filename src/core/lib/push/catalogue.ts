import { buildPushPayload } from '@/core/lib/push/payload'
import { PUSH_CATEGORY_OF_KIND } from '@/declarations/notifications/categories'
import { PUSH_CONSOLE_COPY } from '@/declarations/pwa/copy'
import type { PushPayload } from '@/declarations/pwa/worker'
import type { PushCatalogueEntry } from '@/types/push'
import { NOTIFICATION_KINDS } from '@/utils/constants/notifications'
import type { NotificationKindName } from '@/utils/constants/notifications'

// Tag of a catalogue push, never a stored row
const SAMPLE_TAG = 'essai-'

/**
 * Push of one kind, filled with sample words
 * @param {NotificationKindName} kind - Notification kind
 * @param {string} actorName - Who appears to act
 * @return {PushPayload | null} - Payload
 */

export const samplePushPayload = (
  kind: NotificationKindName,
  actorName: string
): PushPayload | null =>
  buildPushPayload({
    entry: {
      id: `${SAMPLE_TAG}${kind}`,
      kind,
      actorName,
      actorAvatar: null,
      target: null,
      targetId: null,
      subject: PUSH_CONSOLE_COPY.sampleSubject,
      isRead: false,
      createdAt: new Date().toISOString(),
    },
    unread: 0,
    readUrl: null,
  })

/**
 * Every kind still raised, as it lands on a phone
 * @param {string} actorName - Who appears to act
 * @return {PushCatalogueEntry[]} - Catalogue in kind order
 */

export const pushCatalogue = (actorName: string): PushCatalogueEntry[] =>
  NOTIFICATION_KINDS.list
    .filter((entry) => !entry.deprecated)
    .flatMap((entry) => {
      const payload = samplePushPayload(entry.name, actorName)

      return payload
        ? [{ kind: entry.name, category: PUSH_CATEGORY_OF_KIND[entry.name], payload }]
        : []
    })
