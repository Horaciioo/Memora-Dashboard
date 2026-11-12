import 'server-only'

import { prisma } from '@/core/lib/db'
import { COMMON_CAPABILITIES } from '@/core/services/nexus/handlers/game/adapters/types'
import type { GameAdapter } from '@/core/services/nexus/handlers/game/adapters/types'

/**
 * Echo, every card is public
 * @type {GameAdapter}
 */

export const echoAdapter: GameAdapter = {
  capabilities: COMMON_CAPABILITIES,
  state: async (sessionId) => ({
    game: await prisma.echoGame.findUnique({ where: { sessionId } }),
  }),
  turns: (sessionId, skip, take) =>
    prisma.echoFind.findMany({
      where: { sessionId },
      orderBy: [{ round: 'asc' }, { rank: 'asc' }],
      skip,
      take,
    }),
}
