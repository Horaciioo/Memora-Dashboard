import type { PageDetail, PageDocument } from '@/types/pages'
import { DAY_MS } from '@/utils/constants/time'

/**
 * Edit not yet on the server
 * @typedef {Object} OfflineDraft
 * @property {PageDocument} content - Edited document
 * @property {number} baseVersion - Version the edit started from
 * @property {string} updatedAt - Last keystroke
 */

export interface OfflineDraft {
  content: PageDocument
  baseVersion: number
  updatedAt: string
}

/**
 * Page kept on this device
 * @typedef {Object} OfflineEntry
 * @property {string} key - Account and page
 * @property {string} accountId - Owner of the copy
 * @property {PageDetail} page - Last read copy
 * @property {string} savedAt - When it was kept
 * @property {OfflineDraft | null} draft - Unsent edit
 */

export interface OfflineEntry {
  key: string
  accountId: string
  page: PageDetail
  savedAt: string
  draft: OfflineDraft | null
}

/**
 * Store key of a page copy
 * @param {string} accountId - Account
 * @param {string} pageId - Page
 * @return {string} - Key
 */

export const offlineKey = (accountId: string, pageId: string): string => `${accountId}:${pageId}`

/**
 * Copies to drop: other accounts, too old, beyond the cap; an unsent draft stays
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
    (entry, index) => !entry.draft && (index >= rules.max || Date.parse(entry.savedAt) < horizon)
  )

  return [...foreign, ...expired].map((entry) => entry.key)
}

/**
 * What to do with a draft found on open
 * @param {OfflineDraft | null} draft - Unsent edit
 * @param {number} serverVersion - Version on the server
 * @return {'none' | 'resume' | 'conflict'} - Outcome
 */

export const draftOutcome = (draft: OfflineDraft | null, serverVersion: number): 'none' | 'resume' | 'conflict' => {
  if (!draft) return 'none'

  return draft.baseVersion === serverVersion ? 'resume' : 'conflict'
}
