import 'server-only'

import { prisma } from '@/core/lib/db'

/**
 * Game counters per player
 * @param {string} sessionId - Game
 * @return {Promise<Map<string, Record<string, number>>>} - Counters
 */

export const jumbleStats = async (
  sessionId: string
): Promise<Map<string, Record<string, number>>> => {
  const rounds = await prisma.jumbleRound.findMany({
    where: { sessionId, solverId: { not: null } },
    select: { solverId: true, streak: true },
  })
  const stats = new Map<string, Record<string, number>>()

  for (const { solverId, streak } of rounds) {
    const entry = stats.get(solverId!) ?? { solved: 0, bestStreak: 0 }
    entry.solved += 1
    entry.bestStreak = Math.max(entry.bestStreak, streak)
    stats.set(solverId!, entry)
  }

  return stats
}
