import { createProtectedRoute } from '@/core/lib/http/route'
import { setStepDone } from '@/core/services/recruitment/RecruitmentService'
import { Permissions } from '@/utils/constants/permissions'

// Whether the step is being cleared or reopened
const DONE_FIELD = 'done'

export const PATCH = createProtectedRoute({
  permission: Permissions.RecruitmentManage,
  descriptor: { summary: 'Clear or reopen a recruitment timeline step', tags: ['recruitment'] },
  handler: async ({ params, raw, scope }) =>
    setStepDone(params.id, raw[DONE_FIELD] === true, await scope()),
})
