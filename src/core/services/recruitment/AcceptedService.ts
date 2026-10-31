import 'server-only'

import { prisma } from '@/core/lib/db'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { readPortraits } from '@/core/services/recruitment/CandidatePortraits'
import { sessionScope } from '@/core/services/recruitment/reach'
import type { AcceptedCandidate } from '@/types/members'
import { FINISHED_RECRUITMENT_STATUSES } from '@/utils/constants/recruitment'

/**
 * Accepted candidates waiting for their session to close
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<AcceptedCandidate[]>} - Cards by creator
 */

export const listAcceptedCandidates = async (scope: AccessScope): Promise<AcceptedCandidate[]> => {
  const rows = await prisma.recruitmentCandidate.findMany({
    where: {
      outcome: { admits: true },
      session: { AND: [sessionScope(scope), { status: { notIn: FINISHED_RECRUITMENT_STATUSES } }] },
    },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      sessionId: true,
      discordId: true,
      displayName: true,
      session: { select: { youtuberId: true, jobFunction: { select: { name: true } } } },
    },
  })
  const portraits = await readPortraits(rows.map((row) => row.discordId))

  return rows.map((row) => ({
    id: row.id,
    sessionId: row.sessionId,
    youtuberId: row.session.youtuberId,
    name: row.displayName ?? row.discordId,
    avatarUrl: portraits.get(row.discordId) ?? null,
    functionName: row.session.jobFunction.name,
  }))
}
