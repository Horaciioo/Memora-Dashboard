import { createProtectedRoute } from '@/core/lib/http/route'
import { academyScope } from '@/core/services/academy/AcademyScope'
import { REVIEW_FIELDS, removeReview, updateReview } from '@/core/services/academy/AcademyService'
import { Permissions } from '@/utils/constants/permissions'

export const PATCH = createProtectedRoute({
  permission: Permissions.AcademyReviewWrite,
  fields: REVIEW_FIELDS,
  descriptor: { summary: 'Edit the trace of a voice check-in', tags: ['academy'] },
  handler: ({ params, body, session, access }) =>
    updateReview(params.id, academyScope(session, access), body),
})

export const DELETE = createProtectedRoute({
  permission: Permissions.AcademyReviewWrite,
  descriptor: { summary: 'Drop the trace of a voice check-in', tags: ['academy'] },
  handler: ({ params, session, access }) => removeReview(params.id, academyScope(session, access)),
})
