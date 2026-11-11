import 'server-only'

import { prisma } from '@/core/lib/db'
import type { DbCheck } from '@/core/services/nexus/handlers/db/checks/types'

/**
 * Members convoked to a live that ended
 * @type {DbCheck}
 */

export const staleLiveMembers: DbCheck = {
  id: 'staleLiveMembers',
  label: 'Membres encore convoqués à un live terminé',
  fix: '$db.list.liveMember --where=liveId,eq,<live>',
  run: async (limit) =>
    (
      await prisma.liveMember.findMany({
        where: { live: { endedAt: { not: null } } },
        select: { liveId: true, accountId: true },
        take: limit,
      })
    ).map((row) => `${row.liveId}:${row.accountId}`),
}
