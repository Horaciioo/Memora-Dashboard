import 'server-only'

import { prisma } from '@/core/lib/db'
import { COMMON_CAPABILITIES, strip } from '@/core/services/nexus/handlers/game/adapters/types'
import type { GameAdapter } from '@/core/services/nexus/handlers/game/adapters/types'

/**
 * Bomb, the word being typed is hidden
 * @type {GameAdapter}
 */

export const bombAdapter: GameAdapter = {
  capabilities: COMMON_CAPABILITIES,
  state: async (sessionId, reveal) => {
    const game = await prisma.bombGame.findUnique({ where: { sessionId } })

    return {
      game: game && strip([game], ['draft'], reveal)[0],
      players: await prisma.bombPlayer.findMany({ where: { sessionId } }),
    }
  },
  turns: (sessionId, skip, take) =>
    prisma.bombMove.findMany({ where: { sessionId }, orderBy: { createdAt: 'asc' }, skip, take }),
}
