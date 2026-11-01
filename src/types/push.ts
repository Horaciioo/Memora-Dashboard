import type { PushCategoryName } from '@/declarations/notifications/categories'
import type { PushPayload } from '@/declarations/pwa/worker'
import type { PushDeliveryStatusName } from '@/utils/constants/push'
import type { NotificationKindName } from '@/utils/constants/notifications'

/**
 * Subscription the browser hands over
 * @typedef {Object} PushSubscriptionInput
 * @property {string} endpoint - Push service address
 * @property {string} p256dh - Browser public key
 * @property {string} auth - Shared secret
 */

export interface PushSubscriptionInput {
  endpoint: string
  p256dh: string
  auth: string
}

/**
 * One device able to receive pushes
 * @typedef {Object} PushDeviceView
 * @property {string} id - Subscription identifier
 * @property {string | null} device - User agent
 * @property {string} endpoint - Push service address
 * @property {string} createdAt - ISO timestamp
 * @property {string | null} lastSentAt - ISO timestamp
 */

export interface PushDeviceView {
  id: string
  device: string | null
  endpoint: string
  createdAt: string
  lastSentAt: string | null
}

/**
 * Push settings of one member
 * @typedef {Object} PushSettingsView
 * @property {PushCategoryName[]} muted - Silenced families
 * @property {PushDeviceView[]} devices - Subscribed browsers
 */

export interface PushSettingsView {
  muted: PushCategoryName[]
  devices: PushDeviceView[]
}

/**
 * One journal line
 * @typedef {Object} PushDeliveryView
 * @property {string} id - Delivery identifier
 * @property {string} accountName - Recipient
 * @property {NotificationKindName | null} kind - Notification kind
 * @property {PushDeliveryStatusName} status - Outcome
 * @property {number | null} statusCode - Push service answer
 * @property {string | null} device - User agent
 * @property {boolean} isTest - Sent from the catalogue
 * @property {string} createdAt - ISO timestamp
 */

export interface PushDeliveryView {
  id: string
  accountName: string
  kind: NotificationKindName | null
  status: PushDeliveryStatusName
  statusCode: number | null
  device: string | null
  isTest: boolean
  createdAt: string
}

/**
 * One page of the journal
 * @typedef {Object} PushJournalPage
 * @property {PushDeliveryView[]} entries - Newest first
 * @property {string | null} next - Cursor of the next page
 */

export interface PushJournalPage {
  entries: PushDeliveryView[]
  next: string | null
}

/**
 * One kind as it lands on a phone
 * @typedef {Object} PushCatalogueEntry
 * @property {NotificationKindName} kind - Notification kind
 * @property {PushCategoryName} category - Family
 * @property {PushPayload} payload - What the worker draws
 */

export interface PushCatalogueEntry {
  kind: NotificationKindName
  category: PushCategoryName
  payload: PushPayload
}
