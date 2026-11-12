import 'server-only'

import { prisma } from '@/core/lib/db'
import { COMMON_CAPABILITIES } from '@/core/services/nexus/handlers/game/adapters/types'
import type { GameAdapter } from '@/core/services/nexus/handlers/game/adapters/types'

/**
 * Ludo, the board is public
 * @type {GameAdapter}
 */

export const ludoAdapter: GameAdapter = {
  capabilities: COMMON_CAPABILITIES,
  state: async (sessionId) => ({
    game: await prisma.ludoGame.findUnique({ where: { sessionId } }),
    players: await prisma.ludoPlayer.findMany({ where: { sessionId } }),
  }),
  turns: (sessionId, skip, take) =>
    prisma.ludoMove.findMany({ where: { sessionId }, orderBy: { createdAt: 'asc' }, skip, take }),
}
