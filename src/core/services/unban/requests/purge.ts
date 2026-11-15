import 'server-only'

import { prisma } from '@/core/lib/db'
import { RETENTION_POLICIES } from '@/declarations/system/security/privacy'
import { DAY_MS } from '@/utils/constants/time'
import { UnbanStatuses } from '@/utils/constants/unban'

/**
 * Drop the requests decided long ago, with their comments
 * @param {Date} [now] - Moment of the pass
 * @return {Promise<number>} - Requests removed
 */

export const purgeDecidedRequests = async (now: Date = new Date()): Promise<number> => {
  const cutoff = new Date(now.getTime() - RETENTION_POLICIES.unbanDecided * DAY_MS)

  const { count } = await prisma.unbanRequest.deleteMany({
    where: {
      decidedAt: { lt: cutoff },
      status: { in: [UnbanStatuses.Accepted, UnbanStatuses.Refused] },
    },
  })

  return count
}
