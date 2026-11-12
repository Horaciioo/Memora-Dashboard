import 'server-only'

import { prisma } from '@/core/lib/db'
import { COMMON_CAPABILITIES } from '@/core/services/nexus/handlers/game/adapters/types'
import type { GameAdapter } from '@/core/services/nexus/handlers/game/adapters/types'

/**
 * Croquis, the word is hidden until the reveal
 * @type {GameAdapter}
 */

export const croquisAdapter: GameAdapter = {
  capabilities: COMMON_CAPABILITIES,
  state: async (sessionId) => ({
    game: await prisma.croquisGame.findUnique({ where: { sessionId } }),
  }),
  turns: (sessionId, skip, take) =>
    prisma.croquisGuess.findMany({
      where: { sessionId },
      orderBy: [{ round: 'asc' }, { rank: 'asc' }],
      skip,
      take,
    }),
}
