import { createProtectedRoute } from '@/core/lib/http/route'
import { signalCandidate } from '@/core/lib/recruitment/signal'
import { markStage } from '@/core/services/recruitment/InterviewService'
import { Permissions } from '@/utils/constants/permissions'
import { assertFileOpen } from '@/core/services/recruitment/BanService'

export const PUT = createProtectedRoute({
  permission: Permissions.RecruitmentCandidateWrite,
  descriptor: { summary: 'Put a candidate on a moment of their timeline', tags: ['recruitment'] },
  handler: async ({ params, scope, access }) => {
    await assertFileOpen(params.id, access.can(Permissions.RecruitmentManage))
    const marks = await markStage(params.id, params.stage, await scope())
    await signalCandidate(params.id)

    return { marks }
  },
})
