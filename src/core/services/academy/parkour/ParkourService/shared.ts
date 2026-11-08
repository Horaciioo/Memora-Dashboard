import 'server-only'
import { resolvePhase } from '@/core/lib/academy/parkour'
import type { ParkourPhase } from '@/core/lib/academy/parkour'
import { prisma } from '@/core/lib/db'
import type { AcademyScope } from '@/core/services/academy/AcademyScope'
import { toParkourJunior, toParkourSession } from '@/core/services/academy/parkour/phases'
import { notFound } from '@/core/lib/errors'
import { readAnchors } from '@/core/services/auth/LeadService'
import { GONE_MEMBER_STATUSES, MemberRoles } from '@/utils/constants/hierarchy'
import type { Prisma } from '@prisma/client'

// Everything the parkour reads on a junior
export const PARKOUR_SHAPE = {
  account: {
    select: { id: true, displayName: true, discordId: true, discordUsername: true, role: true },
  },
  reviews: { select: { stage: true, status: true } },
  session: {
    select: {
      id: true,
      status: true,
      secondPeriodAt: true,
      summary: true,
      functionId: true,
      jobFunction: { select: { name: true } },
      recruitmentSession: {
        select: { youtuberId: true, responsables: { select: { accountId: true } } },
      },
    },
  },
} satisfies Prisma.AcademyJuniorInclude

export type ParkourRow = Prisma.AcademyJuniorGetPayload<{ include: typeof PARKOUR_SHAPE }>

/**
 * Phase of one loaded junior
 * @param {ParkourRow} row - Junior row
 * @return {ParkourPhase} - Phase
 */

export const phaseOf = (row: ParkourRow): ParkourPhase =>
  resolvePhase(toParkourJunior(row), toParkourSession(row.session))

/**
 * Load a junior
 * @param {string} juniorId - Junior identifier
 * @param {AcademyScope} [scope] - Visibility fragment
 * @return {Promise<ParkourRow>} - Junior row
 */

export const loadJunior = async (juniorId: string, scope?: AcademyScope): Promise<ParkourRow> => {
  const row = await prisma.academyJunior.findFirst({
    where: { id: juniorId, ...(scope ? { session: scope.session, ...scope.juniors } : {}) },
    include: PARKOUR_SHAPE,
  })
  if (!row) throw notFound()

  return row
}

/**
 * Responsables a junior's parkour reports to: the campaign, then the creator, then everyone
 * @param {ParkourRow} row - Junior row
 * @return {Promise<string[]>} - Account identifiers
 */

export const responsablesOf = async (row: ParkourRow): Promise<string[]> => {
  const campaign = row.session.recruitmentSession
  const named = campaign?.responsables.map((seat) => seat.accountId) ?? []
  const anchors = campaign
    ? (await readAnchors(campaign.youtuberId))
        .filter((anchor) => anchor.role === MemberRoles.Responsable)
        .map((anchor) => anchor.accountId)
    : []

  const found = [...new Set([...named, ...anchors])]
  if (found.length > 0) return found

  // No campaign behind the promotion
  const everyone = await prisma.account.findMany({
    where: { role: MemberRoles.Responsable, status: { notIn: GONE_MEMBER_STATUSES } },
    select: { id: true },
  })

  return everyone.map((account) => account.id)
}
