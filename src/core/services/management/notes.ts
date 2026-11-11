import 'server-only'
import { decryptField } from '@/core/lib/crypto'
import { prisma } from '@/core/lib/db'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import {
  MANAGED_MEMBER_SELECT,
  managedAccounts,
  toManagedMember,
} from '@/core/services/management/members'
import { MANAGEMENT_SETTINGS } from '@/declarations/configurations/settings'
import type { ManagedNote } from '@/types/management'

/**
 * Read the private remarks left in the perimeter
 * @param {AccessScope} scope - Perimeter
 * @param {boolean} isAdmin - Viewer sits at admin level
 * @return {Promise<ManagedNote[]>} - Notes, latest first
 */

export const listManagedNotes = async (
  scope: AccessScope,
  isAdmin: boolean
): Promise<ManagedNote[]> => {
  const rows = await prisma.accountNote.findMany({
    // What Memora writes itself is not a remark
    where: { system: false, account: managedAccounts(scope, isAdmin) },
    include: { author: true, account: { select: MANAGED_MEMBER_SELECT } },
    orderBy: { createdAt: 'desc' },
    take: MANAGEMENT_SETTINGS.rowLimit,
  })

  return rows.map((row) => ({
    id: row.id,
    member: toManagedMember(row.account),
    authorId: row.authorId,
    authorName: row.author?.displayName ?? null,
    authorAvatar: row.author?.avatarUrl ?? null,
    body: decryptField(row.body) ?? '',
    pinned: row.pinned,
    createdAt: row.createdAt.toISOString(),
  }))
}
