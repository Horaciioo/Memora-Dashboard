import 'server-only'

import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import { readDeparture } from '@/core/services/members/admin/DepartureService'
import { activeSuspension } from '@/core/services/members/admin/SuspensionService'
import type { MemberAdminState } from '@/types/members'
import { GONE_MEMBER_STATUSES } from '@/utils/constants/hierarchy'

/**
 * Everything the Admin tab of a file shows
 * @param {string} id - Account identifier
 * @return {Promise<MemberAdminState>} - State
 */

export const readAdminState = async (id: string): Promise<MemberAdminState> => {
  const row = await prisma.account.findUnique({
    where: { id },
    select: { status: true, frozenAt: true },
  })
  if (!row) throw notFound()

  const [suspension, departure] = await Promise.all([activeSuspension(id), readDeparture(id)])

  return {
    frozenAt: row.frozenAt?.toISOString() ?? null,
    suspension,
    departure,
    isGone: GONE_MEMBER_STATUSES.includes(row.status),
  }
}
