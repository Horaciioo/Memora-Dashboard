import 'server-only'

import { prisma } from '@/core/lib/db'
import { COMMON_CAPABILITIES, strip } from '@/core/services/nexus/handlers/game/adapters/types'
import type { GameAdapter } from '@/core/services/nexus/handlers/game/adapters/types'

// Hands, piles and sealed cards, shown on a reveal only
const HIDDEN_GAME = ['drawPile', 'discard', 'pending']
const HIDDEN_SEAT = ['hand', 'sealed']

/**
 * Stop & Go, the piles and the hands are hidden
 * @type {GameAdapter}
 */

export const stopgoAdapter: GameAdapter = {
  capabilities: COMMON_CAPABILITIES,
  state: async (sessionId, reveal) => {
    const [game, seats] = await Promise.all([
      prisma.stopGoGame.findUnique({ where: { sessionId } }),
      prisma.stopGoPlayer.findMany({ where: { sessionId }, orderBy: { slot: 'asc' } }),
    ])

    return {
      game: game && strip([game], HIDDEN_GAME, reveal)[0],
      seats: strip(seats, HIDDEN_SEAT, reveal),
    }
  },
  turns: (sessionId, skip, take) =>
    prisma.stopGoMove.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      skip,
      take,
    }),
}
