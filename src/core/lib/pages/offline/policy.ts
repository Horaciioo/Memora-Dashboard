import type { PageDetail } from '@/types/pages'
import { DAY_MS } from '@/utils/constants/time'

/**
 * Page kept on this device
 * @typedef {Object} OfflineEntry
 * @property {string} key - Account and page
 * @property {string} accountId - Owner of the copy
 * @property {PageDetail} page - Last read copy
 * @property {string} savedAt - When it was kept
 * @property {string | null} yState - Shared state, base64
 * @property {boolean} isPending - Holds changes the server lacks
 */

export interface OfflineEntry {
  key: string
  accountId: string
  page: PageDetail
  savedAt: string
  yState: string | null
  isPending: boolean
}

/**
 * Store key of a page copy
 * @param {string} accountId - Account
 * @param {string} pageId - Page
 * @return {string} - Key
 */

export const offlineKey = (accountId: string, pageId: string): string => `${accountId}:${pageId}`

/**
 * Copies to drop: other accounts, too old, beyond the cap; unsent changes stay
 * @param {OfflineEntry[]} entries - Kept copies
 * @param {Object} rules - Retention
 * @param {string} rules.accountId - Signed-in account
 * @param {number} rules.now - Current time
 * @param {number} rules.max - Copies kept
 * @param {number} rules.days - Days kept
 * @return {string[]} - Keys to drop
 */

export const staleEntries = (
  entries: OfflineEntry[],
  rules: { accountId: string; now: number; max: number; days: number }
): string[] => {
  const horizon = rules.now - rules.days * DAY_MS

  // Another account never reads them
  const foreign = entries.filter((entry) => entry.accountId !== rules.accountId)
  const own = entries
    .filter((entry) => entry.accountId === rules.accountId)
    .toSorted((left, right) => Date.parse(right.savedAt) - Date.parse(left.savedAt))

  const expired = own.filter(
    (entry, index) => !entry.isPending && (index >= rules.max || Date.parse(entry.savedAt) < horizon)
  )

  return [...foreign, ...expired].map((entry) => entry.key)
}
