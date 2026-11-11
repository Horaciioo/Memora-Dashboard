import 'server-only'
import { prisma } from '@/core/lib/db'
import { toAbsence } from '@/core/services/absences/AbsenceService'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import {
  MANAGED_MEMBER_SELECT,
  managedAccounts,
  toManagedMember,
} from '@/core/services/management/members'
import { MANAGEMENT_SETTINGS } from '@/declarations/configurations/settings'
import type { ManagedAbsences } from '@/types/management'

/**
 * Read the absences of the perimeter
 * @param {AccessScope} scope - Perimeter
 * @param {boolean} isAdmin - Viewer sits at admin level
 * @return {Promise<ManagedAbsences>} - Requests and their owners
 */

export const listManagedAbsences = async (
  scope: AccessScope,
  isAdmin: boolean
): Promise<ManagedAbsences> => {
  const rows = await prisma.absence.findMany({
    where: { account: managedAccounts(scope, isAdmin) },
    include: { reviewer: true, account: { select: MANAGED_MEMBER_SELECT } },
    orderBy: { startDate: 'desc' },
    take: MANAGEMENT_SETTINGS.rowLimit,
  })

  const members = new Map(rows.map((row) => [row.accountId, toManagedMember(row.account)]))

  return {
    absences: rows.map((row) => toAbsence(row, row.account.displayName)),
    members: [...members.values()],
  }
}
