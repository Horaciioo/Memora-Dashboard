import { startTransition } from 'react'

import { coalesce } from '@/core/lib/realtime/coalesce'
import { REALTIME_SETTINGS } from '@/declarations/system/realtime'

// Latest page read handed in
let latest: () => void = () => undefined

// First signal reads at once, a burst once more
const refresher = coalesce(() => startTransition(latest), REALTIME_SETTINGS.refreshCoalesceMs)

/**
 * Read the page again, signals close together merged into one read
 * @param {() => void} refresh - Page read
 * @return {void}
 */

export const queueRefresh = (refresh: () => void): void => {
  latest = refresh
  refresher.request()
}
