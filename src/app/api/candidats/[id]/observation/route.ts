import { createProtectedRoute } from '@/core/lib/http/route'
import { assertInterviewOpen } from '@/core/services/recruitment/InterviewService'
import { setObserving } from '@/core/services/recruitment/ObserverService'
import { Permissions } from '@/utils/constants/permissions'

export const PUT = createProtectedRoute({
  descriptor: { summary: 'Sit in on an interview as an observer', tags: ['recruitment'] },
  handler: async ({ params, raw, session, access }) => {
    await assertInterviewOpen(params.id, {
      manage: access.can(Permissions.RecruitmentManage),
      viewerId: session.id,
    })
    const joined = raw.joined === true
    await setObserving(params.id, session.id, joined, access.can(Permissions.RecruitmentObserve))

    return { joined }
  },
})
