import { prisma } from '@/core/lib/db'
import { createProtectedRoute } from '@/core/lib/http/route'
import { decideReview } from '@/core/services/academy/AcademyService'
import { academyScope } from '@/core/services/academy/AcademyScope'
import { recordEvent } from '@/core/services/system/ActivityService'
import { ReviewAdvices, ReviewStatuses } from '@/utils/constants/hierarchy'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.AcademyReviewValidate,
  descriptor: { summary: 'Decide a submitted check-in', tags: ['academy'] },
  handler: async ({ params, raw, session, access }) => {
    const reviews = await decideReview(params.id, academyScope(session, access), session.id, {
      status: typeof raw.status === 'string' ? raw.status : null,
      decisionNote: typeof raw.decisionNote === 'string' ? raw.decisionNote : null,
    })

    const decided = reviews.find((review) => review.id === params.id)

    if (decided?.status === ReviewStatuses.Validated) {
      const row = await prisma.academyReview.findUnique({
        where: { id: params.id },
        select: { junior: { select: { accountId: true } } },
      })

      await recordEvent({
        eventType: 'ReviewValidated',
        actorId: session.id,
        subjectId: row?.junior.accountId,
        targetType: 'academy-review',
        targetId: params.id,
        summary: decided.stage,
      })

      // A stopped follow-up does not advance, every other outcome moves the junior forward
      if (decided.advice !== ReviewAdvices.Stop) {
        await recordEvent({
          eventType: 'AcademyAdvanced',
          actorId: session.id,
          subjectId: row?.junior.accountId,
          targetType: 'academy-junior',
          summary: decided.stage,
        })
      }
    }

    return reviews
  },
})
