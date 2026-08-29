import { createProtectedRoute } from '@/core/lib/http/route'
import { removeComment } from '@/core/services/recruitment/RecruitmentService'
import { Permissions } from '@/utils/constants/permissions'

export const DELETE = createProtectedRoute({
  permission: Permissions.RecruitmentCandidateWrite,
  descriptor: { summary: 'Drop a remark left on a candidate', tags: ['recruitment'] },
  handler: async ({ params, scope }) => removeComment(params.id, await scope()),
})
