import 'server-only'

import { prisma } from '@/core/lib/db'
import { COMMON_CAPABILITIES } from '@/core/services/nexus/handlers/game/adapters/types'
import type { GameAdapter } from '@/core/services/nexus/handlers/game/adapters/types'

/**
 * Baccalaureat, answers are hidden until a reveal
 * @type {GameAdapter}
 */

export const baccalaureatAdapter: GameAdapter = {
  capabilities: COMMON_CAPABILITIES,
  state: async (sessionId, reveal) => ({
    rounds: await prisma.baccalaureatRound.findMany({
      where: { sessionId },
      orderBy: { index: 'asc' },
      include: reveal ? { answers: true } : undefined,
    }),
  }),
  turns: (sessionId, skip, take) =>
    prisma.baccalaureatRound.findMany({
      where: { sessionId },
      orderBy: { index: 'asc' },
      skip,
      take,
    }),
}
