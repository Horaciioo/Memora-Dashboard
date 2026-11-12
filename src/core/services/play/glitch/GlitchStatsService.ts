import 'server-only'

import { prisma } from '@/core/lib/db'

/**
 * Game counters per player
 * @param {string} sessionId - Game
 * @return {Promise<Map<string, Record<string, number>>>} - Counters
 */

export const glitchStats = async (
  sessionId: string
): Promise<Map<string, Record<string, number>>> => {
  const rows = await prisma.glitchProgress.findMany({
    where: { sessionId },
    select: { accountId: true, found: true, rank: true },
  })
  const stats = new Map<string, Record<string, number>>()

  for (const { accountId, found, rank } of rows) {
    const entry = stats.get(accountId) ?? { found: 0, completed: 0 }
    entry.found += found.length
    if (rank !== null) entry.completed += 1
    stats.set(accountId, entry)
  }

  return stats
}
