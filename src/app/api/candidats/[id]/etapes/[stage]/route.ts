import { createProtectedRoute } from '@/core/lib/http/route'
import { markStage } from '@/core/services/recruitment/InterviewService'
import { Permissions } from '@/utils/constants/permissions'

export const PUT = createProtectedRoute({
  permission: Permissions.RecruitmentCandidateWrite,
  descriptor: { summary: 'Tick a moment of a candidate timeline', tags: ['recruitment'] },
  handler: async ({ params, raw, scope }) => ({
    marks: await markStage(params.id, params.stage, raw.done === true, await scope()),
  }),
})
