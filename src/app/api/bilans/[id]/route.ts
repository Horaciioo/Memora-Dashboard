import { createProtectedRoute } from '@/core/lib/http/route'
import { REVIEW_FIELDS, removeReview, updateReview } from '@/core/services/academy/AcademyService'
import { Permissions } from '@/utils/constants/permissions'

export const PATCH = createProtectedRoute({
  permission: Permissions.AcademyReviewWrite,
  fields: REVIEW_FIELDS,
  descriptor: { summary: 'Edit the trace of a voice check-in', tags: ['academy'] },
  handler: ({ params, body }) => updateReview(params.id, body),
})

export const DELETE = createProtectedRoute({
  permission: Permissions.AcademyReviewWrite,
  descriptor: { summary: 'Drop the trace of a voice check-in', tags: ['academy'] },
  handler: ({ params }) => removeReview(params.id),
})
