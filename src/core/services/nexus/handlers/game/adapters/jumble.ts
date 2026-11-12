import 'server-only'

import { prisma } from '@/core/lib/db'
import { COMMON_CAPABILITIES, strip } from '@/core/services/nexus/handlers/game/adapters/types'
import type { GameAdapter } from '@/core/services/nexus/handlers/game/adapters/types'

/**
 * Jumble, the answer is hidden
 * @type {GameAdapter}
 */

export const jumbleAdapter: GameAdapter = {
  capabilities: COMMON_CAPABILITIES,
  state: async (sessionId, reveal) => {
    const game = await prisma.jumbleGame.findUnique({ where: { sessionId } })

    return { game: game && strip([game], ['answer', 'display'], reveal)[0] }
  },
  turns: (sessionId, skip, take) =>
    prisma.jumbleRound.findMany({ where: { sessionId }, orderBy: { round: 'asc' }, skip, take }),
}
