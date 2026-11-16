import 'server-only'

import { prisma } from '@/core/lib/db'
import { COMMON_CAPABILITIES, strip } from '@/core/services/nexus/handlers/game/adapters/types'
import type { GameAdapter } from '@/core/services/nexus/handlers/game/adapters/types'

// Map and snapshot are heavy and shown on a reveal only
const HIDDEN_GAME = ['map', 'snapshot']

/**
 * Concordat, the map and the snapshot are hidden
 * @type {GameAdapter}
 */

export const concordatAdapter: GameAdapter = {
  capabilities: COMMON_CAPABILITIES,
  state: async (sessionId, reveal) => {
    const [game, players] = await Promise.all([
      prisma.concordatGame.findUnique({ where: { sessionId } }),
      prisma.concordatPlayer.findMany({ where: { sessionId }, orderBy: { nation: 'asc' } }),
    ])

    return { game: game && strip([game], HIDDEN_GAME, reveal)[0], seats: players }
  },
  turns: (sessionId, skip, take) =>
    prisma.concordatEvent.findMany({
      where: { sessionId },
      orderBy: { tick: 'asc' },
      skip,
      take,
    }),
}
