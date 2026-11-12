import { UnbanLinkStates } from '@/utils/constants/unban'
import type { UnbanLinkStateName } from '@/utils/constants/unban'
import type { Prisma } from '@prisma/client'

/**
 * Query clause matching one state, the database twin of linkStateOf
 * @param {UnbanLinkStateName} state - Wanted state
 * @param {Date} now - Moment of the reading
 * @return {Prisma.UnbanLinkWhereInput} - Clause
 */

export const linkStateWhere = (
  state: UnbanLinkStateName,
  now: Date
): Prisma.UnbanLinkWhereInput => {
  switch (state) {
    case UnbanLinkStates.Revoked:
      return { revokedAt: { not: null } }
    case UnbanLinkStates.Used:
      return { revokedAt: null, usedAt: { not: null } }
    case UnbanLinkStates.Expired:
      return { revokedAt: null, usedAt: null, expiresAt: { lte: now } }
    default:
      return { revokedAt: null, usedAt: null, expiresAt: { gt: now } }
  }
}
