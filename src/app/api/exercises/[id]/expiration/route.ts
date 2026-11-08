import { createProtectedRoute } from '@/core/lib/http/route'
import { expireLink } from '@/core/services/recruitment/ExerciseLinkService'
import { Permissions } from '@/utils/constants/permissions'

export const PUT = createProtectedRoute({
  permission: Permissions.RecruitmentCandidateWrite,
  descriptor: { summary: 'Expire a written-context link', tags: ['recruitment'] },
  handler: async ({ params, scope }) => expireLink(params.id, await scope()),
})
