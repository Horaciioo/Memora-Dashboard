'use client'

import { apiGet, apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useRecapStore } from '@/core/store/recap'
import { RECAP_SETTINGS } from '@/declarations/configurations/settings'
import type { Recap } from '@/types/recap'
import { DAY_MS } from '@/utils/constants/time'

/**
 * Ask for the member's own absence, the sheet opens only when something waits, and on every
 * page load of the dev build, which shows the made-up recap
 * @param {boolean} [isArrival] - The page was just loaded, not a return to the tab
 * @return {Promise<void>} - Settled
 */

export const checkRecap = async (isArrival = false): Promise<void> => {
  const store = useRecapStore.getState()
  const recap = await apiGet<Recap>(API_ROUTES.recap())

  store.offerDemo(recap.demoAvailable)

  if (!recap.isAway) {
    if (isArrival && recap.demoAvailable) await openRecap(true)

    return
  }

  // Nothing happened, the clock simply restarts
  if (recap.threads.length === 0) {
    await markPresent()

    return
  }

  // The deck keeps the window, so the clock can restart without losing it
  store.show(recap)
  deferRecap(recap.since)
  await markPresent()
}

/**
 * Open a recap by hand, the window just seen or the last days, or the made-up one
 * @param {boolean} [demo] - Ask for the made-up recap of the dev build
 * @param {string} [since] - Start of the window, a recap put off picks up from there
 * @return {Promise<void>} - Settled
 */

export const openRecap = async (demo = false, since?: string): Promise<void> => {
  const store = useRecapStore.getState()
  if (store.isLoading) return

  store.setLoading(true)

  try {
    const from =
      since ??
      store.lastSince ??
      new Date(Date.now() - RECAP_SETTINGS.manualWindowDays * DAY_MS).toISOString()
    const recap = await apiGet<Recap>(API_ROUTES.recap({ from, demo }))

    store.show(recap, true)
    if (!demo) deferRecap(recap.since)
  } finally {
    store.setLoading(false)
  }
}

/**
 * Tell the server the member is around
 * @return {Promise<void>} - Settled
 */

export const markPresent = async (): Promise<void> => {
  await apiPost(API_ROUTES.recap(), {})
}

/**
 * Close the sheet, the member has seen it
 * @return {Promise<void>} - Settled
 */

export const dismissRecap = async (): Promise<void> => {
  useRecapStore.getState().hide()
  await markPresent().catch(() => undefined)
}

// Where a recap put off waits, until the member does it from the Home
const PENDING_KEY = 'memora:recap-pending'

/**
 * Event fired on window when the recap put off appears or goes
 * @type {string}
 */

export const PENDING_EVENT = 'memora:recap-pending-changed'

/**
 * Start of the recap the member put off, null when none waits
 * @return {string | null} - ISO start
 */

export const pendingRecap = (): string | null => {
  try {
    return window.localStorage.getItem(PENDING_KEY)
  } catch {
    return null
  }
}

/**
 * Keep a recap for later, it stays on the Home until the member does it
 * @param {string} since - Start of its window
 * @return {void}
 */

export const deferRecap = (since: string): void => {
  try {
    window.localStorage.setItem(PENDING_KEY, since)
    window.dispatchEvent(new Event(PENDING_EVENT))
  } catch {
    // Without storage the recap is simply lost
  }
}

/**
 * Forget the recap put off, the member took it
 * @return {void}
 */

export const clearPendingRecap = (): void => {
  try {
    window.localStorage.removeItem(PENDING_KEY)
    window.dispatchEvent(new Event(PENDING_EVENT))
  } catch {
    // Nothing kept, nothing to forget
  }
}
