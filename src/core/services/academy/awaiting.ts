import 'server-only'

import { prisma } from '@/core/lib/db'
import { readPortraits } from '@/core/services/recruitment/CandidatePortraits'
import type { AwaitingCandidate } from '@/types/academy'

/**
 * Accepted candidates without file
 * @param {string} sessionId - Academy session identifier
 * @return {Promise<AwaitingCandidate[]>} - Candidates waiting
 */

export const listAwaiting = async (sessionId: string): Promise<AwaitingCandidate[]> => {
  const rows = await prisma.recruitmentCandidate.findMany({
    where: {
      outcome: { admits: true },
      admission: null,
      session: { academySessionId: sessionId },
    },
    orderBy: { createdAt: 'asc' },
    select: { id: true, sessionId: true, discordId: true, displayName: true },
  })
  const portraits = await readPortraits(rows.map((row) => row.discordId))

  return rows.map((row) => ({
    id: row.id,
    sessionId: row.sessionId,
    name: row.displayName ?? row.discordId,
    avatarUrl: portraits.get(row.discordId) ?? null,
  }))
}
