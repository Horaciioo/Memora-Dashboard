import { createProtectedRoute } from '@/core/lib/http/route'
import { academyScope } from '@/core/services/academy/AcademyScope'
import { submitReview } from '@/core/services/academy/AcademyService'
import { afterReviewSubmitted, assertReviewComplete } from '@/core/services/academy/ParkourService'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.AcademyReviewWrite,
  descriptor: { summary: 'Submit a check-in for decision', tags: ['academy'] },
  handler: async ({ params, session, access }) => {
    // Account written and every competency graded first
    await assertReviewComplete(params.id)
    const reviews = await submitReview(params.id, academyScope(session, access))
    await afterReviewSubmitted(params.id, session.id)

    return reviews
  },
})
