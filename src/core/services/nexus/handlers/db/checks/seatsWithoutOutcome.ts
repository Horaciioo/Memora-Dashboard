import 'server-only'

import { prisma } from '@/core/lib/db'
import type { DbCheck } from '@/core/services/nexus/handlers/db/checks/types'

/**
 * Seats of a finished game left blank
 * @type {DbCheck}
 */

export const seatsWithoutOutcome: DbCheck = {
  id: 'seatsWithoutOutcome',
  label: 'Sièges d’une partie finie sans issue',
  fix: '$db.get.playSeat --id=<siège>',
  run: async (limit) =>
    (
      await prisma.playSeat.findMany({
        where: { outcome: null, session: { status: 'FINISHED' } },
        select: { id: true },
        take: limit,
      })
    ).map((row) => row.id),
}
