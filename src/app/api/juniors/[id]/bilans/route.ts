import { createProtectedRoute } from '@/core/lib/http/route'
import { academyScope } from '@/core/services/academy/AcademyScope'
import { REVIEW_FIELDS, createReview, listReviews } from '@/core/services/academy/AcademyService'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.AcademyReviewRead,
  descriptor: { summary: 'Read the voice check-ins of a junior', tags: ['academy'] },
  handler: ({ params, session, access }) => listReviews(params.id, academyScope(session, access)),
})

export const POST = createProtectedRoute({
  permission: Permissions.AcademyReviewWrite,
  status: 201,
  fields: REVIEW_FIELDS,
  descriptor: { summary: 'Write the trace of a voice check-in', tags: ['academy'] },
  handler: ({ params, body, session, access }) =>
    createReview(params.id, academyScope(session, access), session.id, body),
})
