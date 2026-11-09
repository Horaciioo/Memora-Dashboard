import { apiGet, apiPut } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { applyPreferences, sanitizePreferences } from '@/core/lib/modview/preferences'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'
import type { ModPreferences, StoredPreferences } from '@/types/modview'

// Save of the browser, read once then dropped
const LEGACY_KEY = 'memora:modview:preferences:v1'

type Patch = Partial<ModPreferences>

const listeners = new Set<() => void>()

// Three layers: kept, temporary, applied
let saved: Patch = {}
let temporary: Patch = {}
let applied = applyPreferences()
let pending: Patch = {}
let liveId: string | null = null
let isScoped = false
let timer: ReturnType<typeof setTimeout> | undefined

const readLegacy = (): Patch => {
  try {
    return sanitizePreferences(JSON.parse(window.localStorage.getItem(LEGACY_KEY) ?? 'null'))
  } catch {
    return {}
  }
}

const dropLegacy = (): void => {
  try {
    window.localStorage.removeItem(LEGACY_KEY)
  } catch {
    // Nothing to drop
  }
}

const emit = (): void => {
  applied = applyPreferences(saved, temporary)
  listeners.forEach((listener) => listener())
}

// Send what waits
const flush = async (): Promise<void> => {
  clearTimeout(timer)
  if (Object.keys(pending).length === 0) return
  const batch = pending
  pending = {}
  try {
    await apiPut(API_ROUTES.modViewPreferences(liveId), { values: batch })
  } catch {
    // Kept for the next save
    pending = { ...batch, ...pending }
  }
}

// Load one profile
const load = async (): Promise<void> => {
  try {
    const stored = await apiGet<StoredPreferences>(API_ROUTES.modViewPreferences(liveId))
    const legacy = readLegacy()

    // First visit carries the browser save over
    if (!stored.isStored && Object.keys(legacy).length > 0) {
      await apiPut(API_ROUTES.modViewPreferences(null), { values: legacy })
      saved = { ...legacy, ...pending }
    } else {
      saved = { ...stored.values, ...pending }
    }
    dropLegacy()
    emit()
  } catch {
    // The visit goes on with local values
  }
}

// Leaving the tab sends the last choices
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') void flush()
  })
}

/**
 * Current applied values
 * @return {ModPreferences} - Stable until a change
 */

export const readApplied = (): ModPreferences => applied

/**
 * Watch changes
 * @param {() => void} listener - Change callback
 * @return {() => void} - Unsubscribe
 */

export const subscribePreferences = (listener: () => void): (() => void) => {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

/**
 * Pick the channel profile
 * @param {string | null} nextLiveId - Live, null for the account
 * @return {Promise<void>}
 */

export const selectProfile = async (nextLiveId: string | null): Promise<void> => {
  if (isScoped && liveId === nextLiveId) return
  await flush()
  liveId = nextLiveId
  // Browser save shows first
  saved = isScoped ? {} : readLegacy()
  isScoped = true
  emit()
  await load()
}

/**
 * Keep a choice, saved after a delay
 * @param {Partial<ModPreferences>} patch - Changed values
 * @return {void}
 */

export const updatePreferences = (patch: Patch): void => {
  saved = { ...saved, ...patch }
  pending = { ...pending, ...patch }
  clearTimeout(timer)
  timer = setTimeout(() => void flush(), LIVE_SETTINGS.preferenceSaveMs)
  emit()
}

/**
 * Try values without keeping them
 * @param {Partial<ModPreferences>} patch - Previewed values
 * @return {void}
 */

export const previewPreferences = (patch: Patch): void => {
  temporary = { ...temporary, ...patch }
  emit()
}

/**
 * Drop the temporary layer
 * @return {void}
 */

export const discardPreview = (): void => {
  temporary = {}
  emit()
}

/**
 * Keep the temporary layer
 * @return {void}
 */

export const commitPreview = (): void => {
  const patch = temporary
  temporary = {}
  updatePreferences(patch)
}
