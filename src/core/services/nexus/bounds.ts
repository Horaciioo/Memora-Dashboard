import 'server-only'

import { prisma } from '@/core/lib/db'
import { NEXUS_COMMANDS } from '@/declarations/nexus/settings'
import type { Prisma } from '@prisma/client'

/**
 * Run reads on one connection with a short statement limit
 * @param {(tx: Prisma.TransactionClient) => Promise<T>} run - Reads to make
 * @return {Promise<T>} - Result
 */

export const boundedRead = <T>(run: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> =>
  prisma.$transaction(async (tx) => {
    // Limit lives for this transaction only
    await tx.$executeRaw`SELECT set_config('statement_timeout', ${String(NEXUS_COMMANDS.readTimeoutMs)}, true)`

    return run(tx)
  })

/**
 * Cap a requested page size
 * @param {unknown} requested - Rows asked for
 * @param {number} [max] - Hard ceiling
 * @return {number} - Rows to take
 */

export const takeOf = (requested: unknown, max: number = NEXUS_COMMANDS.maxRows): number => {
  const asked = Number(requested)

  return Number.isInteger(asked) && asked > 0
    ? Math.min(asked, max)
    : Math.min(NEXUS_COMMANDS.pageSize, max)
}
