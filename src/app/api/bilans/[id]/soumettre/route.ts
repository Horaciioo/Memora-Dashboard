import { createProtectedRoute } from '@/core/lib/http/route'
import { academyScope } from '@/core/services/academy/AcademyScope'
import { submitReview } from '@/core/services/academy/AcademyService'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.AcademyReviewWrite,
  descriptor: { summary: 'Submit a check-in for decision', tags: ['academy'] },
  handler: ({ params, session, access }) => submitReview(params.id, academyScope(session, access)),
})
