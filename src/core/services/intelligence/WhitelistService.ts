import 'server-only'

import { prisma } from '@/core/lib/db'
import { conflict, notFound } from '@/core/lib/errors'
import { ROLE_REGISTRY } from '@/declarations/access/roles'
import { GONE_MEMBER_STATUSES, MemberRoles } from '@/utils/constants/hierarchy'
import { Permissions } from '@/utils/constants/permissions'
import { PermissionEffects } from '@/utils/constants/workflow'
import type { WhitelistState } from '@/types/access'

// Rows a whitelisted member holds
const HELD = {
  permission: Permissions.IntelligenceUse,
  effect: PermissionEffects.Allow,
  youtuberId: null,
}

// Lowest rank admitted without being listed
const AUTOMATIC_RANK = ROLE_REGISTRY.get(MemberRoles.Responsable).rank

/**
 * Read the whitelist and the members that could join it
 * @return {Promise<WhitelistState>} - Admitted members and candidates
 */

export const readWhitelist = async (): Promise<WhitelistState> => {
  const accounts = await prisma.account.findMany({
    where: { status: { notIn: GONE_MEMBER_STATUSES }, botKind: null },
    select: {
      id: true,
      displayName: true,
      avatarUrl: true,
      role: true,
      permissions: { where: HELD, select: { id: true } },
    },
    orderBy: { displayName: 'asc' },
  })

  const rows = accounts.map((account) => ({
    accountId: account.id,
    displayName: account.displayName,
    avatarUrl: account.avatarUrl,
    role: account.role,
    isAutomatic: ROLE_REGISTRY.get(account.role).rank >= AUTOMATIC_RANK,
    isListed: account.permissions.length > 0,
  }))

  return {
    entries: rows
      .filter((row) => row.isAutomatic || row.isListed)
      // Ranks first, then the listed members
      .sort((a, b) => Number(b.isAutomatic) - Number(a.isAutomatic))
      .map(({ accountId, displayName, avatarUrl, role, isAutomatic }) => ({
        accountId,
        displayName,
        avatarUrl,
        role,
        isAutomatic,
      })),
    candidates: rows
      .filter((row) => !row.isAutomatic && !row.isListed)
      .map(({ accountId, displayName }) => ({ accountId, displayName })),
  }
}

/**
 * Admit a member
 * @param {string} accountId - Account identifier
 * @return {Promise<WhitelistState>} - Refreshed whitelist
 */

export const addToWhitelist = async (accountId: string): Promise<WhitelistState> => {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    select: { role: true, permissions: { where: HELD, select: { id: true } } },
  })
  if (!account) throw notFound()
  if (ROLE_REGISTRY.get(account.role).rank >= AUTOMATIC_RANK || account.permissions.length > 0) {
    throw conflict()
  }

  await prisma.accountPermission.create({ data: { accountId, ...HELD } })

  return readWhitelist()
}

/**
 * Remove a member
 * @param {string} accountId - Account identifier
 * @return {Promise<WhitelistState>} - Refreshed whitelist
 */

export const removeFromWhitelist = async (accountId: string): Promise<WhitelistState> => {
  await prisma.accountPermission.deleteMany({ where: { accountId, ...HELD } })

  return readWhitelist()
}
