import 'server-only'
import { prisma } from '@/core/lib/db'
import { PriorityNames } from '@/declarations/reference/fixed'
import { GONE_MEMBER_STATUSES, MemberRoles } from '@/utils/constants/hierarchy'

// Priority and platform every project of the annual reviews starts with
export const PROJECT_PRIORITY = PriorityNames.Normal

export const PROJECT_PLATFORM = 'Discord'

// Key every project of the annual reviews is filed under, followed by its number
export const PROJECT_KEY = 'annual-reviews:'

/**
 * What opening a series of slots made
 * @typedef {Object} OpenedSlots
 * @property {string} projectId - Project of the series
 * @property {number} number - Number of the series
 * @property {string} firstDay - First ISO day
 */

export interface OpenedSlots {
  projectId: string
  number: number
  firstDay: string
}

/**
 * Moderators sitting in a team
 * @param {string} teamId - Team identifier
 * @return {Promise<string[]>} - Account identifiers
 */

export const moderatorsOfTeam = async (teamId: string): Promise<string[]> =>
  (
    await prisma.account.findMany({
      where: {
        role: MemberRoles.Moderateur,
        status: { notIn: GONE_MEMBER_STATUSES },
        teamMemberships: { some: { teamId } },
      },
      select: { id: true },
    })
  ).map((row) => row.id)

/**
 * Responsables of the teams a Moderator sits in, empty when they have none
 * @param {string} accountId - Moderator
 * @return {Promise<string[]>} - Account identifiers
 */

export const leadsOf = async (accountId: string): Promise<string[]> => {
  const leads = await prisma.teamLead.findMany({
    where: { team: { archived: false, members: { some: { accountId } } } },
    select: { accountId: true },
  })

  return [...new Set(leads.map((lead) => lead.accountId))]
}

/**
 * Every Responsable, told when a Moderator without a team takes a slot
 * @return {Promise<string[]>} - Account identifiers
 */

export const everyResponsable = async (): Promise<string[]> =>
  (
    await prisma.account.findMany({
      where: { role: MemberRoles.Responsable, status: { notIn: GONE_MEMBER_STATUSES } },
      select: { id: true },
    })
  ).map((row) => row.id)
