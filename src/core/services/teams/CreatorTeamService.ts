import 'server-only'

import { prisma } from '@/core/lib/db'
import { assertInScope } from '@/core/services/auth/ScopeService'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { toPerson } from '@/core/services/work/shared'
import { ENCADREMENT_ROLES } from '@/declarations/access/roles'
import type { CreatorTeamData } from '@/types/teams'
import {
  AccessCategories,
  GONE_MEMBER_STATUSES,
  type MemberRoleName,
} from '@/utils/constants/hierarchy'
import { FunctionKinds } from '@/utils/constants/workflow'

// Functions a creator can turn into a team
const TEAM_FUNCTIONS = { archived: false, category: AccessCategories.Moderation }

/**
 * Read the teams of one creator
 * @param {string} youtuberId - Creator identifier
 * @param {AccessScope} scope - Creator perimeter
 * @return {Promise<CreatorTeamData>} - Functions and members
 */

export const readCreatorTeams = async (
  youtuberId: string,
  scope: AccessScope
): Promise<CreatorTeamData> => {
  assertInScope(scope, youtuberId)

  const [functions, teams, accounts] = await Promise.all([
    prisma.jobFunction.findMany({ where: TEAM_FUNCTIONS, orderBy: { position: 'asc' } }),
    prisma.team.findMany({
      where: { youtuberId, functionId: { not: null } },
      include: { members: { select: { accountId: true } } },
    }),
    prisma.account.findMany({
      where: {
        youtubers: { some: { id: youtuberId } },
        status: { notIn: GONE_MEMBER_STATUSES },
        role: { notIn: ENCADREMENT_ROLES },
      },
      orderBy: { displayName: 'asc' },
    }),
  ])

  const live = teams.filter((team) => !team.archived)

  return {
    functions: functions.map((entry) => ({
      id: entry.id,
      name: entry.name,
      icon: entry.icon,
      accent: entry.accent,
      isPrimary: entry.kind === FunctionKinds.Primary,
      isEnabled: live.some((team) => team.functionId === entry.id),
    })),
    members: accounts.flatMap((account) => {
      const person = toPerson(account)
      if (!person) return []

      return [
        {
          person,
          role: account.role as MemberRoleName,
          functionIds: live
            .filter((team) => team.members.some((member) => member.accountId === account.id))
            .map((team) => team.functionId!),
        },
      ]
    }),
  }
}

/**
 * Switch the teams of a creator on or off
 * @param {string} youtuberId - Creator identifier
 * @param {string[]} functionIds - Functions kept on
 * @param {AccessScope} scope - Creator perimeter
 * @return {Promise<CreatorTeamData>} - Fresh data
 */

export const setCreatorFunctions = async (
  youtuberId: string,
  functionIds: string[],
  scope: AccessScope
): Promise<CreatorTeamData> => {
  assertInScope(scope, youtuberId)

  const functions = await prisma.jobFunction.findMany({ where: TEAM_FUNCTIONS })

  // One team per function, archived when off
  await prisma.$transaction(
    functions.map((entry) =>
      prisma.team.upsert({
        where: { youtuberId_functionId: { youtuberId, functionId: entry.id } },
        update: { archived: !functionIds.includes(entry.id) },
        create: {
          name: entry.name,
          youtuberId,
          functionId: entry.id,
          archived: !functionIds.includes(entry.id),
        },
      })
    )
  )

  return readCreatorTeams(youtuberId, scope)
}

/**
 * Set the teams one member sits in
 * @param {string} youtuberId - Creator identifier
 * @param {string} accountId - Member identifier
 * @param {string[]} functionIds - Functions of the teams to sit in
 * @param {AccessScope} scope - Creator perimeter
 * @return {Promise<CreatorTeamData>} - Fresh data
 */

export const setMemberTeams = async (
  youtuberId: string,
  accountId: string,
  functionIds: string[],
  scope: AccessScope
): Promise<CreatorTeamData> => {
  assertInScope(scope, youtuberId)

  const teams = await prisma.team.findMany({
    where: { youtuberId, functionId: { not: null }, archived: false },
    select: { id: true, functionId: true },
  })

  const chosen = teams.filter((team) => functionIds.includes(team.functionId!))

  // Replace within this creator only
  await prisma.$transaction([
    prisma.teamMember.deleteMany({
      where: { accountId, teamId: { in: teams.map((team) => team.id) } },
    }),
    prisma.teamMember.createMany({
      data: chosen.map((team) => ({ accountId, teamId: team.id })),
    }),
  ])

  return readCreatorTeams(youtuberId, scope)
}
