import { createProtectedRoute } from '@/core/lib/http/route'
import { academyScope } from '@/core/services/academy/AcademyScope'
import { decideReview } from '@/core/services/academy/AcademyService'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.AcademyReviewValidate,
  descriptor: { summary: 'Decide a submitted check-in', tags: ['academy'] },
  handler: ({ params, raw, session, access }) =>
    decideReview(params.id, academyScope(session, access), session.id, {
      status: typeof raw.status === 'string' ? raw.status : null,
      decisionNote: typeof raw.decisionNote === 'string' ? raw.decisionNote : null,
    }),
})
