import 'server-only'
import { prisma } from '@/core/lib/db'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import {
  MANAGED_MEMBER_SELECT,
  managedAccounts,
  toManagedMember,
} from '@/core/services/management/members'
import { MANAGEMENT_SETTINGS } from '@/declarations/configurations/settings'
import type { ManagedArrival } from '@/types/management'

/**
 * Read when each member arrived
 * @param {AccessScope} scope - Perimeter
 * @param {boolean} isAdmin - Viewer sits at admin level
 * @return {Promise<ManagedArrival[]>} - Arrivals, latest first
 */

export const listManagedArrivals = async (
  scope: AccessScope,
  isAdmin: boolean
): Promise<ManagedArrival[]> => {
  const rows = await prisma.account.findMany({
    where: managedAccounts(scope, isAdmin),
    select: { ...MANAGED_MEMBER_SELECT, joinedAt: true, role: true, status: true },
    orderBy: { joinedAt: 'desc' },
    take: MANAGEMENT_SETTINGS.rowLimit,
  })

  return rows.map((row) => ({
    id: row.id,
    member: toManagedMember(row),
    joinedAt: row.joinedAt.toISOString(),
    role: row.role,
    status: row.status,
  }))
}
