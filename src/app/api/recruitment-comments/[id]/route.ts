import { notFound } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { signalCandidate, signalSession } from '@/core/lib/recruitment/signal'
import { commentSubject, pinComment, removeComment } from '@/core/services/recruitment'
import { commentSessionId } from '@/core/services/recruitment/CommentService'
import { removeSessionComment } from '@/core/services/recruitment/SessionCommentService'
import { Permissions } from '@/utils/constants/permissions'

export const PATCH = createProtectedRoute({
  permission: Permissions.RecruitmentCandidateWrite,
  descriptor: { summary: 'Pin or unpin a remark of a candidate', tags: ['recruitment'] },
  handler: async ({ params, raw, scope }) => {
    // Only a candidate remark rides the rail
    if ((await commentSubject(params.id)) !== 'candidate') throw notFound()

    const candidate = await pinComment(params.id, raw.pinned === true, await scope())
    await signalCandidate(candidate.id)

    return candidate
  },
})

export const DELETE = createProtectedRoute({
  permission: Permissions.RecruitmentCandidateWrite,
  descriptor: {
    summary: 'Drop a remark left on a candidate or a recruitment session',
    tags: ['recruitment'],
  },
  handler: async ({ params, scope }) => {
    if ((await commentSubject(params.id)) === 'candidate') {
      const candidate = await removeComment(params.id, await scope())
      await signalCandidate(candidate.id)

      return candidate
    }

    const sessionId = await commentSessionId(params.id)
    const comments = await removeSessionComment(params.id, await scope())
    if (sessionId) await signalSession(sessionId)

    return comments
  },
})
