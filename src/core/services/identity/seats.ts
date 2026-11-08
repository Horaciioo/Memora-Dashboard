import 'server-only'

import { prisma } from '@/core/lib/db'
import type { PendingSeat } from '@/types/identity'
import { AcademyJuniorStatuses } from '@/utils/constants/hierarchy'

// What the welcome shows of the creator
export const CREATOR_SHAPE = {
  select: { id: true, name: true, accent: true, avatarUrl: true, bannerUrl: true },
}

/**
 * Seat an accepted candidate still has to confirm
 * @param {string} accountId - Pre-generated account
 * @return {Promise<PendingSeat | null>} - Seat or nothing
 */

export const findPendingSeat = async (accountId: string): Promise<PendingSeat | null> => {
  const row = await prisma.academyJunior.findFirst({
    where: {
      accountId,
      confirmedAt: null,
      candidateId: { not: null },
      status: AcademyJuniorStatuses.Active,
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      accountId: true,
      session: { select: { summary: true, jobFunction: { select: { name: true } } } },
      candidate: { select: { session: { select: { youtuber: CREATOR_SHAPE } } } },
    },
  })

  if (!row) return null

  return {
    juniorId: row.id,
    accountId: row.accountId,
    sessionName: row.session.summary ?? row.session.jobFunction.name,
    functionName: row.session.jobFunction.name,
    creator: row.candidate?.session.youtuber ?? null,
  }
}
