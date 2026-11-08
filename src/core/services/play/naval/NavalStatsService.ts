import 'server-only'

import { prisma } from '@/core/lib/db'
import { isDamage } from '@/core/lib/play/naval'

/**
 * Game counters per captain
 * @param {string} sessionId - Game
 * @return {Promise<Map<string, Record<string, number>>>} - Counters
 */

export const navalStats = async (
  sessionId: string
): Promise<Map<string, Record<string, number>>> => {
  const shots = await prisma.navalShot.findMany({
    where: { sessionId },
    select: { shooterId: true, targetId: true, result: true },
  })
  const stats = new Map<string, Record<string, number>>()
  const add = (accountId: string, key: string) => {
    const row = stats.get(accountId) ?? {}
    stats.set(accountId, { ...row, [key]: (row[key] ?? 0) + 1 })
  }

  for (const shot of shots.filter((entry) => isDamage(entry.result))) {
    add(shot.shooterId, 'shots')
    if (shot.result !== 'MISS') add(shot.shooterId, 'hits')
    if (shot.result === 'SUNK') {
      add(shot.shooterId, 'shipsSunk')
      add(shot.targetId, 'shipsLost')
    }
  }

  return stats
}
