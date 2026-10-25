import 'server-only'

import { prisma } from '@/core/lib/db'
import { BACCALAUREAT_SETTINGS } from '@/declarations/play'
import { isCustomCategory } from '@/core/lib/play/baccalaureat/settings'

// Counter keys of the Baccalaureat
const STAT_KEYS = {
  words: 'words',
  soloOrUnique: 'uniqueWords',
  stops: 'stops',
  category: (id: string) => `category:${id}`,
}

/**
 * Game counters per player
 * @param {string} sessionId - Game
 * @return {Promise<Map<string, Record<string, number>>>} - Counters
 */

export const baccalaureatStats = async (
  sessionId: string
): Promise<Map<string, Record<string, number>>> => {
  const [answers, stops] = await Promise.all([
    prisma.baccalaureatAnswer.findMany({
      where: { round: { sessionId }, valid: true },
      select: { accountId: true, category: true, points: true },
    }),
    prisma.baccalaureatRound.groupBy({
      by: ['stoppedById'],
      where: { sessionId, stoppedById: { not: null } },
      _count: true,
    }),
  ])
  const stats = new Map<string, Record<string, number>>()
  const add = (accountId: string, key: string, value: number) => {
    const entry = stats.get(accountId) ?? {}
    entry[key] = (entry[key] ?? 0) + value
    stats.set(accountId, entry)
  }

  // Valid words and their points
  for (const answer of answers) {
    add(answer.accountId, STAT_KEYS.words, 1)
    if (answer.points !== BACCALAUREAT_SETTINGS.points.shared)
      add(answer.accountId, STAT_KEYS.soloOrUnique, 1)
    if (!isCustomCategory(answer.category))
      add(answer.accountId, STAT_KEYS.category(answer.category), answer.points)
  }

  // Stops called
  for (const stop of stops)
    if (stop.stoppedById) add(stop.stoppedById, STAT_KEYS.stops, stop._count)

  return stats
}
