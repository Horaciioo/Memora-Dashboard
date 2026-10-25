import 'server-only'

import { AsyncLocalStorage } from 'node:async_hooks'
import { cache } from 'react'

import { bindZoneReader, isKnownZone } from '@/utils/format/zone'

// Zone held by one request
interface ZoneSlot {
  zone: string | null
}

// Route handlers
const storage = new AsyncLocalStorage<ZoneSlot>()

// Server component renders
const renderSlot = cache((): ZoneSlot => ({ zone: null }))

// Current request slot
const slotOf = (): ZoneSlot => storage.getStore() ?? renderSlot()

bindZoneReader(() => slotOf().zone)

/**
 * Run a handler in its zone
 * @param {() => Promise<T>} run - Handler
 * @return {Promise<T>} - Handler result
 */

export const runInRequestZone = <T>(run: () => Promise<T>): Promise<T> =>
  storage.run({ zone: null }, run)

/**
 * Hold the member zone
 * @param {string | null} zone - Member zone
 * @return {void}
 */

export const holdRequestZone = (zone: string | null): void => {
  slotOf().zone = isKnownZone(zone) ? zone : null
}
