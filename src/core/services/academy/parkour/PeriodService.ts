import 'server-only'

import { promotionPeriods, toPeriodInput } from '@/core/lib/academy/periods'
import { prisma } from '@/core/lib/db'
import type { PeriodView } from '@/types/academy'

/**
 * Read the dated periods of a promotion
 * @param {string} sessionId - Promotion identifier
 * @return {Promise<PeriodView[]>} - Periods that exist, in order
 */

export const readPeriods = async (sessionId: string): Promise<PeriodView[]> => {
  const session = await prisma.academySession.findUnique({
    where: { id: sessionId },
    select: {
      startsAt: true,
      secondPeriodAt: true,
      juniors: {
        select: {
          reviewOneDueAt: true,
          reviewFinalDueAt: true,
          deadlineAt: true,
          reviews: { select: { stage: true, status: true, decision: true, decidedAt: true } },
        },
      },
    },
  })
  if (!session) return []

  const iso = (moment: Date | null) => moment?.toISOString() ?? null

  return promotionPeriods(toPeriodInput(session)).map((period) => ({
    key: period.key,
    startsAt: period.startsAt.toISOString(),
    reviewsFrom: iso(period.reviewsFrom),
    endsAt: iso(period.endsAt),
    expectedEndsAt: iso(period.expectedEndsAt),
  }))
}
