import 'server-only'

import { prisma } from '@/core/lib/db'
import { LegacyStatuses } from '@/utils/constants/hierarchy'

/**
 * Members released from events at a moment
 * @param {string[]} accountIds - Members convened
 * @param {Date} at - Moment of the event
 * @return {Promise<Set<string>>} - Members released
 */

export const releasedFrom = async (accountIds: string[], at: Date): Promise<Set<string>> => {
  if (accountIds.length === 0) return new Set()

  const rows = await prisma.legacyTrack.findMany({
    where: {
      accountId: { in: accountIds },
      status: LegacyStatuses.Running,
      startsAt: { lte: at },
      endsAt: { gte: at },
    },
    select: { accountId: true },
  })

  return new Set(rows.map((row) => row.accountId))
}
