import 'server-only'

import { prisma } from '@/core/lib/db'
import { COMMON_CAPABILITIES } from '@/core/services/nexus/handlers/game/adapters/types'
import type { GameAdapter } from '@/core/services/nexus/handlers/game/adapters/types'

/**
 * Golf, nothing is hidden from the table
 * @type {GameAdapter}
 */

export const golfAdapter: GameAdapter = {
  capabilities: COMMON_CAPABILITIES,
  state: async (sessionId) => ({
    game: await prisma.golfGame.findUnique({ where: { sessionId } }),
    players: await prisma.golfPlayer.findMany({ where: { sessionId } }),
  }),
  turns: (sessionId, skip, take) =>
    prisma.golfMove.findMany({ where: { sessionId }, orderBy: { createdAt: 'asc' }, skip, take }),
}
