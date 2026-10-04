import { prisma } from '@/core/lib/db'
import { createProtectedRoute } from '@/core/lib/http/route'
import { decisionEffect } from '@/core/lib/academy/parkour'
import { decideReview } from '@/core/services/academy/AcademyService'
import { academyScope } from '@/core/services/academy/AcademyScope'
import { applyDecision, readThirdPeriodDeadline } from '@/core/services/academy/ParkourService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { notify } from '@/core/services/system/NotificationService'
import { ReviewAdvices, ReviewStatuses } from '@/utils/constants/hierarchy'
import type { AcademyStageName, ReviewAdviceName } from '@/utils/constants/hierarchy'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.AcademyReviewValidate,
  descriptor: { summary: 'Decide a submitted check-in', tags: ['academy'] },
  handler: async ({ params, raw, session, access }) => {
    const scope = academyScope(session, access)
    const decision = typeof raw.decision === 'string' ? raw.decision : null

    // A third period needs its deadline before anything is written
    const pending = await prisma.academyReview.findUnique({
      where: { id: params.id },
      select: { stage: true },
    })
    const opensThird =
      pending !== null &&
      decision === ReviewAdvices.Bonus &&
      decisionEffect(pending.stage as AcademyStageName, decision as ReviewAdviceName) ===
        'thirdPeriod'
    const deadlineAt = opensThird ? readThirdPeriodDeadline(raw) : null

    const reviews = await decideReview(params.id, scope, session.id, {
      status: typeof raw.status === 'string' ? raw.status : null,
      decision,
      decisionNote: typeof raw.decisionNote === 'string' ? raw.decisionNote : null,
    })

    const decided = reviews.find((review) => review.id === params.id)
    if (decided?.status !== ReviewStatuses.Validated) return reviews

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

    // The junior hears of it before a dismissal closes their access
    await notify({
      kind: 'ReviewDecided',
      recipients: [row?.junior.accountId],
      actorId: session.id,
      target: 'training',
      subject: decided.stage,
    })

    await applyDecision(params.id, session.id, deadlineAt)

    return reviews
  },
})
