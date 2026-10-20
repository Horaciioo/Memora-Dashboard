import 'server-only'

import { prisma } from '@/core/lib/db'
import { forbidden } from '@/core/lib/errors'
import { assertInScope } from '@/core/services/auth/ScopeService'
import { openCreatorFunctions } from '@/core/services/teams/FunctionTeamService'
import { TEAM_COPY } from '@/declarations/teams/copy'
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
 * Switch the functions of a creator on or off, closing one is left to the root administrator
 * @param {string} youtuberId - Creator identifier
 * @param {string[]} functionIds - Functions kept on
 * @param {AccessScope} scope - Creator perimeter
 * @param {boolean} isRoot - Signed-in member is the root administrator
 * @return {Promise<CreatorTeamData>} - Fresh data
 */

export const setCreatorFunctions = async (
  youtuberId: string,
  functionIds: string[],
  scope: AccessScope,
  isRoot: boolean
): Promise<CreatorTeamData> => {
  assertInScope(scope, youtuberId)

  const open = await prisma.youtuberFunction.findMany({
    where: { youtuberId },
    select: { functionId: true },
  })
  const closing = open.some((seat) => !functionIds.includes(seat.functionId))
  if (closing && !isRoot) throw forbidden(TEAM_COPY.closeRootOnly)

  await openCreatorFunctions(youtuberId, functionIds)

  return readCreatorTeams(youtuberId, scope)
}
