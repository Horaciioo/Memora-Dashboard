import 'server-only'
import { prisma } from '@/core/lib/db'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import {
  MANAGED_MEMBER_SELECT,
  managedAccounts,
  toManagedMember,
} from '@/core/services/management/members'
import type { ManagedBirthday } from '@/types/management'

/**
 * Read the birthdays members agreed to share
 * @param {AccessScope} scope - Perimeter
 * @param {boolean} isAdmin - Viewer sits at admin level
 * @return {Promise<ManagedBirthday[]>} - Birthdays, unordered
 */

export const listManagedBirthdays = async (
  scope: AccessScope,
  isAdmin: boolean
): Promise<ManagedBirthday[]> => {
  const rows = await prisma.account.findMany({
    where: { ...managedAccounts(scope, isAdmin), birthday: { not: null }, celebrateBirthday: true },
    select: { ...MANAGED_MEMBER_SELECT, birthday: true },
  })

  return rows.map((row) => ({
    id: row.id,
    member: toManagedMember(row),
    birthday: row.birthday!.toISOString(),
  }))
}
