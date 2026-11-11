import 'server-only'
import { prisma } from '@/core/lib/db'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import {
  MANAGED_MEMBER_SELECT,
  managedAccounts,
  toManagedMember,
} from '@/core/services/management/members'
import { activeFunctions } from '@/core/services/reference/lookups'
import { MANAGEMENT_SETTINGS } from '@/declarations/configurations/settings'
import type { ManagedFunction, ManagedFunctions } from '@/types/management'

/**
 * Read who holds which function
 * @param {AccessScope} scope - Perimeter
 * @param {boolean} isAdmin - Viewer sits at admin level
 * @return {Promise<ManagedFunctions>} - One row per held function, one for a member with none
 */

export const listManagedFunctions = async (
  scope: AccessScope,
  isAdmin: boolean
): Promise<ManagedFunctions> => {
  const [accounts, functions] = await Promise.all([
    prisma.account.findMany({
      where: managedAccounts(scope, isAdmin),
      select: { ...MANAGED_MEMBER_SELECT, functions: { select: { functionId: true } } },
      orderBy: { displayName: 'asc' },
      take: MANAGEMENT_SETTINGS.rowLimit,
    }),
    activeFunctions(),
  ])

  const kinds = new Map(functions.map((entry) => [entry.id, entry.kind]))

  return {
    functions: functions.map((entry) => ({ id: entry.id, label: entry.name })),
    rows: accounts.flatMap((account): ManagedFunction[] => {
      const member = toManagedMember(account)

      if (account.functions.length === 0) {
        return [{ id: account.id, member, functionId: null, kind: null }]
      }

      return account.functions.map((held) => ({
        id: `${account.id}:${held.functionId}`,
        member,
        functionId: held.functionId,
        kind: kinds.get(held.functionId) ?? null,
      }))
    }),
  }
}
