import { createProtectedRoute } from '@/core/lib/http/route'
import { REVIEW_FIELDS, createReview, listReviews } from '@/core/services/academy/AcademyService'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.AcademyReviewRead,
  descriptor: { summary: 'Read the voice check-ins of a junior', tags: ['academy'] },
  handler: ({ params }) => listReviews(params.id),
})

export const POST = createProtectedRoute({
  permission: Permissions.AcademyReviewWrite,
  status: 201,
  fields: REVIEW_FIELDS,
  descriptor: { summary: 'Write the trace of a voice check-in', tags: ['academy'] },
  handler: ({ params, body, session }) => createReview(params.id, session.id, body),
})
