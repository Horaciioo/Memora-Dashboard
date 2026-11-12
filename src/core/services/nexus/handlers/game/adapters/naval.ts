import 'server-only'

import { prisma } from '@/core/lib/db'
import { COMMON_CAPABILITIES, strip } from '@/core/services/nexus/handlers/game/adapters/types'
import type { GameAdapter } from '@/core/services/nexus/handlers/game/adapters/types'

/**
 * Naval, fleets and offers are hidden
 * @type {GameAdapter}
 */

export const navalAdapter: GameAdapter = {
  capabilities: COMMON_CAPABILITIES,
  state: async (sessionId, reveal) => ({
    game: await prisma.navalGame.findUnique({ where: { sessionId } }),
    matches: await prisma.navalMatch.findMany({ where: { sessionId } }),
    players: strip(
      await prisma.navalPlayer.findMany({ where: { sessionId } }),
      ['fleet', 'offer'],
      reveal
    ),
  }),
  turns: (sessionId, skip, take) =>
    prisma.navalShot.findMany({ where: { sessionId }, orderBy: { createdAt: 'asc' }, skip, take }),
}
