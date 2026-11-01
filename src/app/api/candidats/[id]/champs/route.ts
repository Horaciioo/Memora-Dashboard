import { prisma } from '@/core/lib/db'
import { createProtectedRoute } from '@/core/lib/http/route'
import { candidateFields, candidateSession, observerIdsOf } from '@/core/services/recruitment'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.RecruitmentCandidateWrite,
  descriptor: { summary: 'Read the fields of a candidate', tags: ['recruitment'] },
  handler: async ({ params, scope }) => {
    const sessionId = await candidateSession(params.id, await scope())
    const session = await prisma.recruitmentSession.findUniqueOrThrow({
      where: { id: sessionId },
      select: { youtuberId: true },
    })

    return candidateFields(session.youtuberId, await observerIdsOf(params.id))
  },
})
