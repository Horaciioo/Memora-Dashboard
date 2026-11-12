import 'server-only'

import { prisma } from '@/core/lib/db'
import type { DbCheck } from '@/core/services/nexus/handlers/db/checks/types'

/**
 * Running games nobody sits in
 * @type {DbCheck}
 */

export const emptyRunningGames: DbCheck = {
  id: 'emptyRunningGames',
  label: 'Parties en cours sans siège actif',
  fix: '$game.stop --game=<partie> --outcome=abandon',
  run: async (limit) =>
    (
      await prisma.playSession.findMany({
        where: { status: 'RUNNING', seats: { none: { leftAt: null, kickedAt: null } } },
        select: { id: true },
        take: limit,
      })
    ).map((row) => row.id),
}
