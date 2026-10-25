import 'server-only'

import { Prisma } from '@prisma/client'

import { publishLive } from '@/core/lib/lives/bus'
import { CHANGE_SIGNALS } from '@/declarations/system/signals'
import type { ChangeSignal } from '@/declarations/system/signals'

// Pending send of each signal
const timers = new Map<string, ReturnType<typeof setTimeout>>()

/**
 * Tell every open session a signal was raised, writes landing together send one
 * @param {ChangeSignal} signal - Signal raised
 * @return {void}
 */

export const announceChange = (signal: ChangeSignal): void => {
  if (timers.has(signal.topic)) return

  timers.set(
    signal.topic,
    setTimeout(() => {
      timers.delete(signal.topic)
      publishLive(signal.topic, {}).catch(() => undefined)
    }, signal.settleMs)
  )
}

/**
 * Check a write raises a signal
 * @param {ChangeSignal} signal - Signal checked
 * @param {string} model - Model name
 * @param {string} operation - Operation name
 * @param {unknown} args - Operation arguments
 * @return {boolean} - Signal raised
 */

const raises = (signal: ChangeSignal, model: string, operation: string, args: unknown): boolean => {
  if (!signal.writes.has(operation)) return false

  const fields = signal.watched[model]
  if (!fields) return false
  if (fields === true) return true

  // Row creation opens no session yet
  if (operation === 'create' || operation === 'createMany') return false

  const written = args as { data?: object; update?: object }
  return Object.keys(written.data ?? written.update ?? {}).some((key) => fields.includes(key))
}

/**
 * Client extension raising the signals after any write that moves them
 * @type {ReturnType<typeof Prisma.defineExtension>}
 */

export const changeSignalExtension = Prisma.defineExtension({
  name: 'change-signal',
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const result = await query(args)

        for (const signal of CHANGE_SIGNALS) {
          if (raises(signal, model, operation, args)) announceChange(signal)
        }

        return result
      },
    },
  },
})
