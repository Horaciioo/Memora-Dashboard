import 'server-only'

import { prisma } from '@/core/lib/db'

// Counter key per line kind
const STAT_KEYS = { CAPTURE: 'captures', HOME: 'pawnsHome' } as const

// Face counted apart
const SIX = 6

/**
 * Game counters per player
 * @param {string} sessionId - Game
 * @return {Promise<Map<string, Record<string, number>>>} - Counters
 */

export const ludoStats = async (
  sessionId: string
): Promise<Map<string, Record<string, number>>> => {
  const [moves, sixes, taken] = await Promise.all([
    prisma.ludoMove.groupBy({
      by: ['accountId', 'kind'],
      where: { sessionId, kind: { in: ['CAPTURE', 'HOME'] } },
      _count: true,
    }),
    prisma.ludoMove.groupBy({
      by: ['accountId'],
      where: { sessionId, kind: 'ROLL', dice: SIX },
      _count: true,
    }),
    prisma.ludoMove.groupBy({
      by: ['victimId'],
      where: { sessionId, kind: 'CAPTURE' },
      _count: true,
    }),
  ])
  const stats = new Map<string, Record<string, number>>()
  const add = (accountId: string | null, key: string, count: number) => {
    if (!accountId) return
    stats.set(accountId, { ...stats.get(accountId), [key]: count })
  }

  for (const move of moves)
    add(move.accountId, STAT_KEYS[move.kind as keyof typeof STAT_KEYS], move._count)
  for (const row of sixes) add(row.accountId, 'sixes', row._count)
  for (const row of taken) add(row.victimId, 'pawnsLost', row._count)

  return stats
}
