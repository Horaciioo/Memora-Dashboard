import 'server-only'

import { cache } from 'react'

import { prisma } from '@/core/lib/db'
import { forbidden } from '@/core/lib/errors'
import { ADMINISTRATION_ROLES } from '@/declarations/access/roles'
import { isRootIdentity } from '@/declarations/access/identity'
import { GONE_MEMBER_STATUSES } from '@/utils/constants/hierarchy'
import type { MemberRoleName } from '@/utils/constants/hierarchy'
import type { CreatorLead, LeadAnchor } from '@/types/access'

/**
 * Anchors of one creator
 * @param {string} youtuberId - Creator identifier
 * @return {Promise<LeadAnchor[]>} - Anchored responsables
 */

export const readAnchors = async (youtuberId: string): Promise<LeadAnchor[]> => {
  const rows = await prisma.youtuberLead.findMany({
    where: { youtuberId },
    include: {
      account: { select: { id: true, displayName: true, avatarUrl: true, role: true } },
      team: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'asc' },
  })

  return rows.map((row) => ({
    accountId: row.account.id,
    displayName: row.account.displayName,
    avatarUrl: row.account.avatarUrl,
    role: row.account.role,
    teamId: row.team?.id ?? null,
    teamName: row.team?.name ?? null,
  }))
}

/**
 * Administration of one creator: every Admin and Responsable attached to it or anchored on it
 * @param {string} youtuberId - Creator identifier
 * @return {Promise<LeadAnchor[]>} - Admins first, then responsables
 */

export const readAdministration = async (youtuberId: string): Promise<LeadAnchor[]> => {
  const [rows, anchors] = await Promise.all([
    prisma.account.findMany({
      where: {
        role: { in: ADMINISTRATION_ROLES },
        status: { notIn: GONE_MEMBER_STATUSES },
        OR: [
          { youtubers: { some: { id: youtuberId } } },
          { ledYoutubers: { some: { youtuberId } } },
        ],
      },
      select: { id: true, displayName: true, avatarUrl: true, role: true },
    }),
    readAnchors(youtuberId),
  ])
  const narrowed = new Map(anchors.map((anchor) => [anchor.accountId, anchor]))

  return rows
    .map((row) => ({
      accountId: row.id,
      displayName: row.displayName,
      avatarUrl: row.avatarUrl,
      role: row.role,
      teamId: narrowed.get(row.id)?.teamId ?? null,
      teamName: narrowed.get(row.id)?.teamName ?? null,
    }))
    .sort(
      (left, right) =>
        ADMINISTRATION_ROLES.indexOf(left.role) - ADMINISTRATION_ROLES.indexOf(right.role) ||
        left.displayName.localeCompare(right.displayName, 'fr')
    )
}

/**
 * Creators one member leads
 * @param {string} accountId - Account identifier
 * @return {Promise<CreatorLead[]>} - Anchored creators
 */

export const readLedCreators = cache(async (accountId: string): Promise<CreatorLead[]> => {
  const rows = await prisma.youtuberLead.findMany({
    where: { accountId, youtuber: { archived: false } },
    include: {
      youtuber: { select: { id: true, name: true, handle: true, accent: true, avatarUrl: true } },
      team: { select: { id: true, name: true } },
    },
    orderBy: { youtuber: { position: 'asc' } },
  })

  return rows.map((row) => ({
    id: row.youtuber.id,
    name: row.youtuber.name,
    handle: row.youtuber.handle,
    accent: row.youtuber.accent,
    avatarUrl: row.youtuber.avatarUrl,
    teamId: row.team?.id ?? null,
    teamName: row.team?.name ?? null,
  }))
})

/**
 * Led creator identifiers
 * @param {string} accountId - Account identifier
 * @return {Promise<string[]>} - Creator identifiers
 */

export const readLedCreatorIds = cache(async (accountId: string): Promise<string[]> => {
  const rows = await prisma.youtuberLead.findMany({
    where: { accountId },
    select: { youtuberId: true },
  })

  return rows.map((row) => row.youtuberId)
})

/**
 * Reject a plain moderator
 * @param {string[]} accountIds - Submitted accounts
 * @return {Promise<void>} - Throws on a plain moderator
 */

const assertEncadrement = async (accountIds: string[]): Promise<void> => {
  if (accountIds.length === 0) return

  const eligible = await prisma.account.count({
    where: { id: { in: accountIds }, role: { in: ADMINISTRATION_ROLES } },
  })

  if (eligible !== accountIds.length) throw forbidden()
}

/**
 * Replace the anchors
 * @param {string} youtuberId - Creator identifier
 * @param {string[]} accountIds - Responsables to anchor
 * @param {Record<string, string | null>} [teams] - Team each responsable narrows to
 * @return {Promise<LeadAnchor[]>} - Administration of the creator
 */

export const replaceAnchors = async (
  youtuberId: string,
  accountIds: string[],
  teams: Record<string, string | null> = {}
): Promise<LeadAnchor[]> => {
  const wanted = [...new Set(accountIds)]
  await assertEncadrement(wanted)

  // Anchors are rebuilt in one go so a half-written perimeter never becomes readable
  await prisma.$transaction([
    prisma.youtuberLead.deleteMany({
      where: { youtuberId, accountId: { notIn: wanted.length > 0 ? wanted : [''] } },
    }),
    ...wanted.map((accountId) =>
      prisma.youtuberLead.upsert({
        where: { youtuberId_accountId: { youtuberId, accountId } },
        update: { teamId: teams[accountId] ?? null },
        create: { youtuberId, accountId, teamId: teams[accountId] ?? null },
      })
    ),
  ])

  return readAdministration(youtuberId)
}

/**
 * Change the level of an anchored responsable
 * @param {string} accountId - Account identifier
 * @param {MemberRoleName} role - Wanted level, encadrement only
 * @return {Promise<void>} - Saved
 */

export const setLeadRole = async (accountId: string, role: MemberRoleName): Promise<void> => {
  if (!ADMINISTRATION_ROLES.includes(role)) throw forbidden()

  const account = await prisma.account.findUnique({
    where: { id: accountId },
    select: { discordId: true, role: true },
  })

  // The root keeps its level, a Moderateur is no anchor
  if (
    !account ||
    isRootIdentity(account.discordId) ||
    !ADMINISTRATION_ROLES.includes(account.role)
  ) {
    throw forbidden()
  }

  await prisma.account.update({ where: { id: accountId }, data: { role } })
}
