import 'server-only'

import { Prisma } from '@prisma/client'

import { publishLive } from '@/core/lib/lives/bus'
import { ACCESS_SIGNAL } from '@/declarations/access/signal'

// Pending send
let timer: ReturnType<typeof setTimeout> | null = null

/**
 * Tell every open session to re-read its access
 * @return {void}
 */

export const announceAccessChange = (): void => {
  if (timer) return

  timer = setTimeout(() => {
    timer = null
    publishLive(ACCESS_SIGNAL.topic, {}).catch(() => undefined)
  }, ACCESS_SIGNAL.settleMs)
}

/**
 * Check a write moves access
 * @param {string} model - Model name
 * @param {string} operation - Operation name
 * @param {unknown} args - Operation arguments
 * @return {boolean} - Access moves
 */

const movesAccess = (model: string, operation: string, args: unknown): boolean => {
  if (!ACCESS_SIGNAL.writes.has(operation)) return false

  const fields = (ACCESS_SIGNAL.watched as Record<string, readonly string[] | true>)[model]
  if (!fields) return false
  if (fields === true) return true

  // Row creation opens no session yet
  if (operation === 'create' || operation === 'createMany') return false

  const written = args as { data?: object; update?: object }
  return Object.keys(written.data ?? written.update ?? {}).some((key) => fields.includes(key))
}

/**
 * Client extension raising the signal after any write that moves access
 * @type {ReturnType<typeof Prisma.defineExtension>}
 */

export const accessSignalExtension = Prisma.defineExtension({
  name: 'access-signal',
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const result = await query(args)
        if (movesAccess(model, operation, args)) announceAccessChange()

        return result
      },
    },
  },
})
