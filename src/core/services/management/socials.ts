import 'server-only'
import { prisma } from '@/core/lib/db'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import {
  MANAGED_MEMBER_SELECT,
  managedAccounts,
  toManagedMember,
} from '@/core/services/management/members'
import { MANAGEMENT_SETTINGS } from '@/declarations/configurations/settings'
import type { ManagedSocials } from '@/types/management'

/**
 * Read the profiles declared in the perimeter
 * @param {AccessScope} scope - Perimeter
 * @param {boolean} isAdmin - Viewer sits at admin level
 * @return {Promise<ManagedSocials>} - Profiles and the networks they live on
 */

export const listManagedSocials = async (
  scope: AccessScope,
  isAdmin: boolean
): Promise<ManagedSocials> => {
  const [rows, networks] = await Promise.all([
    prisma.socialLink.findMany({
      where: { account: managedAccounts(scope, isAdmin) },
      include: { account: { select: MANAGED_MEMBER_SELECT } },
      orderBy: [{ account: { displayName: 'asc' } }, { position: 'asc' }],
      take: MANAGEMENT_SETTINGS.rowLimit,
    }),
    prisma.socialNetwork.findMany({
      where: { archived: false },
      orderBy: { position: 'asc' },
    }),
  ])

  return {
    socials: rows.map((row) => ({
      id: row.id,
      member: toManagedMember(row.account),
      networkId: row.networkId,
      label: row.label,
      accent: row.accent,
      handle: row.handle,
      url: row.url,
    })),
    networks: networks.map((network) => ({
      id: network.id,
      label: network.name,
      accent: network.accent,
    })),
  }
}
