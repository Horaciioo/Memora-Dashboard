import { createProtectedRoute } from '@/core/lib/http/route'
import { signalCandidate } from '@/core/lib/recruitment/signal'
import { candidateSession } from '@/core/services/recruitment'
import { recruitmentModeOf } from '@/core/services/recruitment/access'
import { readCandidate } from '@/core/services/recruitment/CandidateService'
import { maskForObserver } from '@/core/services/recruitment/ObserverMask'
import { setObserving } from '@/core/services/recruitment/ObserverService'
import { Permissions } from '@/utils/constants/permissions'

export const PUT = createProtectedRoute({
  descriptor: { summary: 'Sit in on an interview as an observer', tags: ['recruitment'] },
  handler: async ({ params, raw, session, scope, access }) => {
    const joined = raw.joined === true

    // A reader only sits in on the creators of their perimeter
    if (access.can(Permissions.RecruitmentRead)) {
      await candidateSession(params.id, await scope())
    }

    const sessionId = await setObserving(
      params.id,
      session.id,
      joined,
      access.can(Permissions.RecruitmentObserve) || access.can(Permissions.RecruitmentRead)
    )

    await signalCandidate(params.id, sessionId)

    // The whole card, so the page follows without a reload
    const mode = await recruitmentModeOf(access, session.id, sessionId)
    const candidate = await readCandidate(params.id)

    return mode === 'observe' ? maskForObserver(candidate) : candidate
  },
})
