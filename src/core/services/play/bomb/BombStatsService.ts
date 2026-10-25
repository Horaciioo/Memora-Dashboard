import 'server-only'

import { prisma } from '@/core/lib/db'

// Counter key per move kind
const STAT_KEYS = { WORD: 'words', BLAST: 'blasts', LIFE: 'hearts' } as const

/**
 * Game counters per player
 * @param {string} sessionId - Game
 * @return {Promise<Map<string, Record<string, number>>>} - Counters
 */

export const bombStats = async (
  sessionId: string
): Promise<Map<string, Record<string, number>>> => {
  const moves = await prisma.bombMove.groupBy({
    by: ['accountId', 'kind'],
    where: { sessionId },
    _count: true,
  })
  const stats = new Map<string, Record<string, number>>()
  for (const move of moves) {
    const entry = stats.get(move.accountId) ?? {}
    entry[STAT_KEYS[move.kind]] = move._count
    stats.set(move.accountId, entry)
  }

  return stats
}
