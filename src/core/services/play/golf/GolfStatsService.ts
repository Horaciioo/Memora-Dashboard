import 'server-only'

import { prisma } from '@/core/lib/db'

// Counter key per move kind
const STAT_KEYS = { SHOT: 'strokes', HOLED: 'holes', POWER: 'powers', FALL: 'falls' } as const

/**
 * Game counters per player
 * @param {string} sessionId - Game
 * @return {Promise<Map<string, Record<string, number>>>} - Counters
 */

export const golfStats = async (
  sessionId: string
): Promise<Map<string, Record<string, number>>> => {
  const [moves, aces] = await Promise.all([
    prisma.golfMove.groupBy({ by: ['accountId', 'kind'], where: { sessionId }, _count: true }),
    prisma.golfMove.groupBy({
      by: ['accountId'],
      where: { sessionId, kind: 'HOLED', strokes: 1 },
      _count: true,
    }),
  ])
  const stats = new Map<string, Record<string, number>>()
  const entryOf = (accountId: string) => stats.get(accountId) ?? {}
  for (const move of moves)
    stats.set(move.accountId, { ...entryOf(move.accountId), [STAT_KEYS[move.kind]]: move._count })
  for (const ace of aces) stats.set(ace.accountId, { ...entryOf(ace.accountId), aces: ace._count })

  return stats
}
