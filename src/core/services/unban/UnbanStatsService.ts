import 'server-only'

import { prisma } from '@/core/lib/db'
import { median, requestWhere } from '@/core/lib/unban/requestFilter'
import { scopedWhere } from '@/core/services/auth/ScopeService'
import { assertCanRead } from '@/core/services/unban/requests/query'
import { UNBAN_SETTINGS } from '@/declarations/configurations/settings'
import { DAY_MS } from '@/utils/constants/time'
import { UnbanStatuses } from '@/utils/constants/unban'
import type { UnbanCaller } from '@/core/services/unban/links/shared'
import type { UnbanOverview } from '@/types/unban'

/**
 * Moment a number of days before another
 * @param {Date} now - Reference
 * @param {number} days - Days back
 * @return {Date} - Earlier moment
 */

const daysBefore = (now: Date, days: number): Date => new Date(now.getTime() - days * DAY_MS)

/**
 * Figures of the overview over the perimeter
 * @param {UnbanCaller} caller - Who acts
 * @param {string} [youtuberId] - One creator only
 * @return {Promise<UnbanOverview>} - Counts and median delay
 */

export const readOverview = async (
  caller: UnbanCaller,
  youtuberId?: string
): Promise<UnbanOverview> => {
  assertCanRead(caller)

  const now = new Date()
  const month = daysBefore(now, UNBAN_SETTINGS.statsMonthDays)
  const base = (where: object) =>
    scopedWhere('unbanRequest', caller.scope, {
      ...requestWhere({ youtuberId }, caller.actorId),
      ...where,
    })

  const [byStatus, receivedRecent, receivedMonth, decided] = await Promise.all([
    prisma.unbanRequest.groupBy({ by: ['status'], where: base({}), _count: { _all: true } }),
    prisma.unbanRequest.count({
      where: base({ submittedAt: { gte: daysBefore(now, UNBAN_SETTINGS.statsRecentDays) } }),
    }),
    prisma.unbanRequest.count({ where: base({ submittedAt: { gte: month } }) }),
    prisma.unbanRequest.findMany({
      where: base({ decidedAt: { gte: month } }),
      select: { submittedAt: true, decidedAt: true },
    }),
  ])

  const countOf = (status: string): number =>
    byStatus.find((row) => row.status === status)?._count._all ?? 0

  return {
    pending: countOf(UnbanStatuses.Pending),
    inReview: countOf(UnbanStatuses.InReview),
    receivedRecent,
    receivedMonth,
    decidedMonth: decided.length,
    medianDecisionMs: median(
      decided.map((row) => (row.decidedAt?.getTime() ?? 0) - row.submittedAt.getTime())
    ),
  }
}
