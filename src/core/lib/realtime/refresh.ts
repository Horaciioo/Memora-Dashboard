import { startTransition } from 'react'

import { REALTIME_SETTINGS } from '@/declarations/system/realtime'

// One refresh for a burst of signals
let pending = 0

/**
 * Read the page again, signals close together merged into one read
 * @param {() => void} refresh - Page read
 * @return {void}
 */

export const queueRefresh = (refresh: () => void): void => {
  if (pending) return
  pending = window.setTimeout(() => {
    pending = 0
    startTransition(refresh)
  }, REALTIME_SETTINGS.refreshCoalesceMs)
}
