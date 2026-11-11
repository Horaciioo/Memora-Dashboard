import 'server-only'

import { prisma } from '@/core/lib/db'
import type { DbCheck } from '@/core/services/nexus/handlers/db/checks/types'

/**
 * Sign-in sessions past expiry
 * @type {DbCheck}
 */

export const expiredSessions: DbCheck = {
  id: 'expiredSessions',
  label: 'Sessions expirées non purgées',
  fix: '$system.queue.run --queue=maintenance',
  run: async (limit) =>
    (
      await prisma.session.findMany({
        where: { expiresAt: { lt: new Date() } },
        select: { id: true },
        take: limit,
      })
    ).map((row) => row.id),
}
