import 'server-only'

import { prisma } from '@/core/lib/db'

/**
 * Game counters per player
 * @param {string} sessionId - Game
 * @return {Promise<Map<string, Record<string, number>>>} - Counters
 */

export const suspensStats = async (
  sessionId: string
): Promise<Map<string, Record<string, number>>> => {
  const [hits, rounds] = await Promise.all([
    prisma.suspensMove.findMany({
      where: { sessionId, isHit: true },
      select: { accountId: true, cells: true },
    }),
    prisma.suspensRound.findMany({
      where: { sessionId },
      select: { setterId: true, solverId: true, isSolved: true },
    }),
  ])
  const stats = new Map<string, Record<string, number>>()
  const entryOf = (accountId: string) => stats.get(accountId) ?? { found: 0, solved: 0, hanged: 0 }

  for (const { accountId, cells } of hits) {
    const entry = entryOf(accountId)
    entry.found += cells
    stats.set(accountId, entry)
  }
  for (const { setterId, solverId, isSolved } of rounds) {
    if (solverId) {
      const solver = entryOf(solverId)
      solver.solved += 1
      stats.set(solverId, solver)
    }
    if (!isSolved) {
      const setter = entryOf(setterId)
      setter.hanged += 1
      stats.set(setterId, setter)
    }
  }

  return stats
}
