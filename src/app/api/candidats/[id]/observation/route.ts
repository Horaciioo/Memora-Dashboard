import { createProtectedRoute } from '@/core/lib/http/route'
import { signalCandidate } from '@/core/lib/recruitment/signal'
import { setObserving } from '@/core/services/recruitment/ObserverService'
import { Permissions } from '@/utils/constants/permissions'

export const PUT = createProtectedRoute({
  descriptor: { summary: 'Sit in on an interview as an observer', tags: ['recruitment'] },
  handler: async ({ params, raw, session, access }) => {
    const joined = raw.joined === true
    await setObserving(params.id, session.id, joined, access.can(Permissions.RecruitmentObserve))

    await signalCandidate(params.id)

    return { joined }
  },
})
