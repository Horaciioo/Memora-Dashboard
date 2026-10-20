import { createProtectedRoute } from '@/core/lib/http/route'
import { removeSessionComment } from '@/core/services/recruitment/SessionCommentService'
import { Permissions } from '@/utils/constants/permissions'

export const DELETE = createProtectedRoute({
  permission: Permissions.RecruitmentCandidateWrite,
  descriptor: { summary: 'Drop a remark left on a recruitment session', tags: ['recruitment'] },
  handler: async ({ params, scope }) => removeSessionComment(params.id, await scope()),
})
