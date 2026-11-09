import 'server-only'
import { HELD_FUNCTIONS, toMemberFunctions } from '@/core/services/reference/functions'
import { isRootIdentity } from '@/declarations/access/identity'
import type { MemberSummary } from '@/types/members'
import { AcademyJuniorStatuses } from '@/utils/constants/hierarchy'
import type { Prisma } from '@prisma/client'

// Relations every moderator row needs
export const SUMMARY_INCLUDE = {
  division: true,
  youtubers: true,
  ...HELD_FUNCTIONS,
  academyJuniors: {
    where: { status: AcademyJuniorStatuses.Active },
    orderBy: { startedAt: 'desc' },
    take: 1,
    include: { dispositif: true },
  },
} satisfies Prisma.AccountInclude

type SummaryRow = Prisma.AccountGetPayload<{ include: typeof SUMMARY_INCLUDE }>

/**
 * Extra counters folded onto a list row
 * @typedef {Object} SummaryExtras
 * @property {number} notesCount - Private remarks left on the account
 * @property {boolean} isAbsent - Covered by an approved absence today
 */

interface SummaryExtras {
  notesCount: number
  isAbsent: boolean
}

/**
 * Map an account row to its list shape
 * @param {SummaryRow} row - Account row with its references
 * @param {SummaryExtras} extras - Counters resolved alongside the row
 * @return {MemberSummary} - List row
 */

export const toSummary = (row: SummaryRow, extras: SummaryExtras): MemberSummary => ({
  id: row.id,
  displayName: row.displayName,
  discordId: row.discordId,
  avatarUrl: row.avatarUrl,
  bannerUrl: row.bannerUrl,
  role: row.role,
  status: row.status,
  academyDispositif: row.academyJuniors[0]?.dispositif
    ? {
        id: row.academyJuniors[0].dispositif.id,
        label: row.academyJuniors[0].dispositif.name,
        accent: row.academyJuniors[0].dispositif.accent,
      }
    : null,
  academyJuniorId: row.academyJuniors[0]?.id ?? null,
  academySessionId: row.academyJuniors[0]?.sessionId ?? null,
  division: row.division
    ? {
        id: row.division.id,
        label: row.division.name,
      }
    : null,
  youtubers: row.youtubers.map((youtuber) => ({
    id: youtuber.id,
    label: youtuber.name,
    accent: youtuber.accent,
    image: youtuber.avatarUrl,
  })),
  functions: toMemberFunctions(row.functions),
  joinedAt: row.joinedAt.toISOString(),
  isRoot: isRootIdentity(row.discordId),
  notesCount: extras.notesCount,
  isAbsent: extras.isAbsent,
})
