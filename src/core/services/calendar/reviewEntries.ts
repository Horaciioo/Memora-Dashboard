import 'server-only'

import { DECLARED_DAYS_BEFORE, isReviewOpen } from '@/core/lib/academy/reviewTemplates'
import { prisma } from '@/core/lib/db'
import { AcademyJuniorStatuses, AcademySessionStatuses } from '@/utils/constants/hierarchy'
import type { AcademyStageName, ReviewStatusName } from '@/utils/constants/hierarchy'
import { CalendarKinds, EventPurposes } from '@/utils/constants/workflow'
import type { EventPurposeName } from '@/utils/constants/workflow'
import { DAY_MS } from '@/utils/constants/time'

/**
 * Declare the check-ins of the periods about to end, one week ahead, for the trainers and responsables
 * @return {Promise<void>} - Entries created where missing
 */

export const openDueReviews = async (): Promise<void> => {
  const horizon = new Date(Date.now() + DECLARED_DAYS_BEFORE * DAY_MS)

  const templates = await prisma.eventTemplate.findMany({
    where: {
      archived: false,
      purpose: { in: [EventPurposes.ReviewOne, EventPurposes.ReviewFinal] },
    },
  })
  if (templates.length === 0) return

  const juniors = await prisma.academyJunior.findMany({
    where: {
      status: AcademyJuniorStatuses.Active,
      session: { status: { in: [AcademySessionStatuses.Open, AcademySessionStatuses.Running] } },
      OR: [{ reviewOneDueAt: { lte: horizon } }, { reviewFinalDueAt: { lte: horizon } }],
    },
    include: {
      account: { select: { displayName: true } },
      reviews: { select: { stage: true, status: true } },
    },
  })
  if (juniors.length === 0) return

  const existing = await prisma.calendarEvent.findMany({
    where: {
      juniorId: { in: juniors.map((junior) => junior.id) },
      templateId: { in: templates.map((template) => template.id) },
    },
    select: { juniorId: true, templateId: true },
  })
  const planned = new Set(existing.map((entry) => `${entry.juniorId}:${entry.templateId}`))

  for (const junior of juniors) {
    const state = {
      stage: junior.stage as AcademyStageName,
      reviews: junior.reviews.map((review) => ({
        stage: review.stage as AcademyStageName,
        status: review.status as ReviewStatusName,
      })),
    }
    const dueOf: Record<string, Date | null> = {
      [EventPurposes.ReviewOne]: junior.reviewOneDueAt,
      [EventPurposes.ReviewFinal]: junior.reviewFinalDueAt,
    }

    for (const template of templates) {
      const purpose = template.purpose as EventPurposeName
      const dueAt = dueOf[purpose]
      if (!dueAt || dueAt > horizon || planned.has(`${junior.id}:${template.id}`)) continue
      if (!isReviewOpen(purpose, state)) continue

      await prisma.calendarEvent.create({
        data: {
          title: `${template.name}, ${junior.account.displayName}`,
          // A period: the week before the end of the junior's period, when the check-in is declared
          kind: CalendarKinds.Period,
          allDay: true,
          templateId: template.id,
          visibility: template.visibility,
          startsAt: new Date(dueAt.getTime() - DECLARED_DAYS_BEFORE * DAY_MS),
          endsAt: dueAt,
          ownerId: junior.trainerId,
          trainerId: junior.trainerId,
          juniorId: junior.id,
          accountId: junior.accountId,
          sessionId: junior.sessionId,
        },
      })
    }
  }
}
