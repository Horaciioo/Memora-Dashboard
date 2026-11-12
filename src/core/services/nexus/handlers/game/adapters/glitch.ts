import 'server-only'

import { prisma } from '@/core/lib/db'
import { COMMON_CAPABILITIES, strip } from '@/core/services/nexus/handlers/game/adapters/types'
import type { GameAdapter } from '@/core/services/nexus/handlers/game/adapters/types'

/**
 * Glitch, the seed of the pictures is hidden
 * @type {GameAdapter}
 */

export const glitchAdapter: GameAdapter = {
  capabilities: COMMON_CAPABILITIES,
  state: async (sessionId, reveal) => {
    const game = await prisma.glitchGame.findUnique({ where: { sessionId } })

    return { game: game && strip([game], ['seed'], reveal)[0] }
  },
  turns: (sessionId, skip, take) =>
    prisma.glitchProgress.findMany({
      where: { sessionId },
      orderBy: [{ round: 'asc' }, { createdAt: 'asc' }],
      skip,
      take,
    }),
}
