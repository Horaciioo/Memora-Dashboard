import 'server-only'

import { prisma } from '@/core/lib/db'
import { COMMON_CAPABILITIES, strip } from '@/core/services/nexus/handlers/game/adapters/types'
import type { GameAdapter } from '@/core/services/nexus/handlers/game/adapters/types'

/**
 * Suspens, the secret word is hidden
 * @type {GameAdapter}
 */

export const suspensAdapter: GameAdapter = {
  capabilities: COMMON_CAPABILITIES,
  state: async (sessionId, reveal) => {
    const game = await prisma.suspensGame.findUnique({ where: { sessionId } })

    return { game: game && strip([game], ['word', 'display'], reveal)[0] }
  },
  turns: (sessionId, skip, take) =>
    prisma.suspensMove.findMany({
      where: { sessionId },
      orderBy: [{ round: 'asc' }, { createdAt: 'asc' }],
      skip,
      take,
    }),
}
