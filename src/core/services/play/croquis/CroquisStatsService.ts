import 'server-only'

import { prisma } from '@/core/lib/db'

/**
 * Game counters per player
 * @param {string} sessionId - Game
 * @return {Promise<Map<string, Record<string, number>>>} - Counters
 */

export const croquisStats = async (
  sessionId: string
): Promise<Map<string, Record<string, number>>> => {
  const [guesses, rounds] = await Promise.all([
    prisma.croquisGuess.findMany({ where: { sessionId }, select: { accountId: true, rank: true } }),
    prisma.croquisRound.findMany({
      where: { sessionId },
      select: { drawerId: true, solvers: true },
    }),
  ])
  const stats = new Map<string, Record<string, number>>()
  const entryOf = (accountId: string) =>
    stats.get(accountId) ?? { found: 0, firsts: 0, drawn: 0, understood: 0 }

  for (const { accountId, rank } of guesses) {
    const entry = entryOf(accountId)
    entry.found += 1
    if (rank === 1) entry.firsts += 1
    stats.set(accountId, entry)
  }
  for (const { drawerId, solvers } of rounds) {
    const entry = entryOf(drawerId)
    entry.drawn += 1
    if (solvers > 0) entry.understood += 1
    stats.set(drawerId, entry)
  }

  return stats
}
