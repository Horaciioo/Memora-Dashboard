import 'server-only'

import { prisma } from '@/core/lib/db'

/**
 * Game counters per player
 * @param {string} sessionId - Game
 * @return {Promise<Map<string, Record<string, number>>>} - Counters
 */

export const concordatStats = async (
  sessionId: string
): Promise<Map<string, Record<string, number>>> => {
  const players = await prisma.concordatPlayer.findMany({
    where: { sessionId },
    select: { accountId: true, peakTiles: true, provinces: true },
  })

  return new Map(
    players.map((player) => [
      player.accountId,
      { tiles: player.peakTiles, provinces: player.provinces },
    ])
  )
}
