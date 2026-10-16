import 'server-only'

import { livesBeforeReview } from '@/core/lib/academy/parkour'
import { phaseLead } from '@/core/lib/academy/phaseLead'
import { resolveJourney } from '@/core/lib/academy/parkourTimeline'
import { prisma } from '@/core/lib/db'
import type { AcademyScope } from '@/core/services/academy/AcademyScope'
import { notFound } from '@/core/lib/errors'
import { resolveBoth, thresholds } from '@/core/services/academy/parkour/phases'
import type { PimTimeline } from '@/types/academy'
/**
 * Read the journey of one junior, resolved from where they stand
 * @param {string} juniorId - Junior identifier
 * @param {AcademyScope} scope - Visibility fragment
 * @return {Promise<PimTimeline>} - Timeline
 */

export const readTimeline = async (juniorId: string, scope: AcademyScope): Promise<PimTimeline> => {
  const junior = await prisma.academyJunior.findFirst({
    where: { id: juniorId, session: scope.session, ...scope.juniors },
    include: {
      reviews: { select: { stage: true, status: true } },
      session: { select: { status: true, secondPeriodAt: true } },
    },
  })
  if (!junior) throw notFound()

  const { phase, progress } = resolveBoth(junior, junior.session)
  const livesNeeded = livesBeforeReview(junior.stage, thresholds())

  return {
    juniorId,
    sessionId: junior.sessionId,
    phase,
    steps: resolveJourney(phase, progress, (current) =>
      phaseLead(current, livesNeeded, junior.deadlineAt)
    ),
  }
}
