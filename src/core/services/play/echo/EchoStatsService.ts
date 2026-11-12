import 'server-only'

import { prisma } from '@/core/lib/db'

/**
 * Game counters per player
 * @param {string} sessionId - Game
 * @return {Promise<Map<string, Record<string, number>>>} - Counters
 */

export const echoStats = async (
  sessionId: string
): Promise<Map<string, Record<string, number>>> => {
  const finds = await prisma.echoFind.findMany({
    where: { sessionId },
    select: { accountId: true, rank: true },
  })
  const stats = new Map<string, Record<string, number>>()

  for (const { accountId, rank } of finds) {
    const entry = stats.get(accountId) ?? { found: 0, firsts: 0 }
    entry.found += 1
    if (rank === 1) entry.firsts += 1
    stats.set(accountId, entry)
  }

  return stats
}
