import { offlineKey, staleEntries } from '@/core/lib/pages/offline/policy'
import type { OfflineDraft, OfflineEntry } from '@/core/lib/pages/offline/policy'
import { PAGE_SETTINGS } from '@/declarations/configurations/pages'
import { PAGE_OFFLINE_STORE } from '@/declarations/pages/offline'
import type { PageDetail } from '@/types/pages'

/**
 * Open the device store, null where IndexedDB is missing
 * @return {Promise<IDBDatabase | null>} - Database
 */

const openStore = (): Promise<IDBDatabase | null> =>
  new Promise((resolve) => {
    if (typeof indexedDB === 'undefined') return resolve(null)

    const request = indexedDB.open(PAGE_OFFLINE_STORE.database, PAGE_OFFLINE_STORE.version)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(PAGE_OFFLINE_STORE.table)) {
        request.result.createObjectStore(PAGE_OFFLINE_STORE.table, { keyPath: 'key' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => resolve(null)
  })

/**
 * Run one request on the table
 * @param {IDBTransactionMode} mode - Read or write
 * @param {(table: IDBObjectStore) => IDBRequest<T>} run - Request
 * @return {Promise<T | null>} - Result
 */

const withTable = async <T>(mode: IDBTransactionMode, run: (table: IDBObjectStore) => IDBRequest<T>): Promise<T | null> => {
  const database = await openStore()
  if (!database) return null

  return new Promise((resolve) => {
    const request = run(database.transaction(PAGE_OFFLINE_STORE.table, mode).objectStore(PAGE_OFFLINE_STORE.table))
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => resolve(null)
  })
}

/**
 * Every copy on the device
 * @return {Promise<OfflineEntry[]>} - Copies
 */

const readAll = async (): Promise<OfflineEntry[]> =>
  ((await withTable('readonly', (table) => table.getAll())) as OfflineEntry[] | null) ?? []

/**
 * Drop copies of other accounts and old ones
 * @param {string} accountId - Signed-in account
 * @return {Promise<void>} - Pruned
 */

export const pruneOfflinePages = async (accountId: string): Promise<void> => {
  const stale = staleEntries(await readAll(), {
    accountId,
    now: Date.now(),
    max: PAGE_SETTINGS.offlinePages,
    days: PAGE_SETTINGS.offlineDays,
  })

  await Promise.all(stale.map((key) => withTable('readwrite', (table) => table.delete(key))))
}

/**
 * Copy of one page
 * @param {string} accountId - Signed-in account
 * @param {string} pageId - Page
 * @return {Promise<OfflineEntry | null>} - Copy
 */

export const readOfflinePage = async (accountId: string, pageId: string): Promise<OfflineEntry | null> =>
  ((await withTable('readonly', (table) => table.get(offlineKey(accountId, pageId)))) as OfflineEntry | undefined) ??
  null

/**
 * Pages readable offline, newest first; one account at a time lives here
 * @return {Promise<OfflineEntry[]>} - Copies
 */

export const listOfflinePages = async (): Promise<OfflineEntry[]> =>
  (await readAll()).toSorted((left, right) => Date.parse(right.savedAt) - Date.parse(left.savedAt))

/**
 * Keep the last read copy, the draft stays
 * @param {string} accountId - Signed-in account
 * @param {PageDetail} page - Page read
 * @return {Promise<void>} - Kept
 */

export const rememberPage = async (accountId: string, page: PageDetail): Promise<void> => {
  if (PAGE_SETTINGS.offlinePages === 0) return

  const current = await readOfflinePage(accountId, page.id)
  const entry: OfflineEntry = {
    key: offlineKey(accountId, page.id),
    accountId,
    page,
    savedAt: new Date().toISOString(),
    draft: current?.draft ?? null,
  }

  await withTable('readwrite', (table) => table.put(entry))
  await pruneOfflinePages(accountId)
}

/**
 * Keep or clear the unsent edit
 * @param {string} accountId - Signed-in account
 * @param {PageDetail} page - Page edited
 * @param {OfflineDraft | null} draft - Edit, null once sent
 * @return {Promise<void>} - Kept
 */

export const keepDraft = async (accountId: string, page: PageDetail, draft: OfflineDraft | null): Promise<void> => {
  const current = await readOfflinePage(accountId, page.id)

  await withTable('readwrite', (table) =>
    table.put({
      key: offlineKey(accountId, page.id),
      accountId,
      page: current?.page ?? page,
      savedAt: current?.savedAt ?? new Date().toISOString(),
      draft,
    } satisfies OfflineEntry)
  )
}

/**
 * Erase every copy on the device
 * @return {Promise<void>} - Erased
 */

export const wipeOfflinePages = (): Promise<void> =>
  new Promise((resolve) => {
    if (typeof indexedDB === 'undefined') return resolve()

    const request = indexedDB.deleteDatabase(PAGE_OFFLINE_STORE.database)
    request.onsuccess = () => resolve()
    request.onerror = () => resolve()
    request.onblocked = () => resolve()
  })

export { draftOutcome } from '@/core/lib/pages/offline/policy'
export type { OfflineDraft, OfflineEntry } from '@/core/lib/pages/offline/policy'
