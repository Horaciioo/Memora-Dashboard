import 'server-only'
import { prisma } from '@/core/lib/db'
import { invalidInput } from '@/core/lib/errors'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { HELD_FUNCTIONS, toMemberFunctions } from '@/core/services/reference/functions'
import { ROLE_REGISTRY } from '@/declarations/access/roles'
import { peopleInScope } from '@/core/services/work/shared'
import { LIVE_FIELD_COPY } from '@/declarations/lives/copy'
import { DISCORD_FUNCTIONS, LIVE_FUNCTIONS } from '@/declarations/lives/registries'
import { COORDINATOR_FUNCTION } from '@/declarations/reference/fixed'
import type { FieldOption } from '@/types/forms'
import { activeAbsenceFilter } from '@/core/services/absences/AbsenceService'
import { GLOBAL_ROLES, GONE_MEMBER_STATUSES, MemberRoles } from '@/utils/constants/hierarchy'
import type { Prisma } from '@prisma/client'

/**
 * Holders of the Coordinator function, never a Junior
 * @param {string} [youtuberId] - Creator the live is for, every creator when absent
 * @return {Prisma.AccountWhereInput} - Account filter
 */

// Discord only, no live trade
const DISCORD_ONLY: Prisma.AccountWhereInput = {
  functions: { some: { jobFunction: { name: { in: DISCORD_FUNCTIONS } } } },
  NOT: { functions: { some: { jobFunction: { name: { in: [...LIVE_FUNCTIONS] } } } } },
}

const holderWhere = (youtuberId?: string): Prisma.AccountWhereInput => ({
  status: { notIn: GONE_MEMBER_STATUSES },
  role: { not: MemberRoles.Junior },
  NOT: DISCORD_ONLY,
  functions: { some: { jobFunction: { name: COORDINATOR_FUNCTION } } },
  ...(youtuberId && { youtubers: { some: { id: youtuberId } } }),
})

/**
 * Who may coordinate a live: the Coordinators, the Responsables of the creator and every Admin
 * @param {string} [youtuberId] - Creator the live is for, every creator when absent
 * @return {Prisma.AccountWhereInput} - Account filter
 */

const coordinatorWhere = (youtuberId?: string): Prisma.AccountWhereInput => ({
  status: { notIn: GONE_MEMBER_STATUSES },
  OR: [
    holderWhere(youtuberId),
    { role: { in: GLOBAL_ROLES } },
    {
      role: MemberRoles.Responsable,
      NOT: DISCORD_ONLY,
      ...(youtuberId && { youtubers: { some: { id: youtuberId } } }),
    },
  ],
})

// Order the picker lists them in: Coordinators, Responsables, Admins, anyone already seated
const COORDINATOR_RANKS: Record<string, number> = {
  [MemberRoles.Responsable]: 1,
  [MemberRoles.Employe]: 2,
  [MemberRoles.Admin]: 2,
}

/**
 * Members offered as Coordinators, each tied to the creators they cover
 * @param {AccessScope} [scope] - Creator perimeter
 * @param {string[]} [seated] - Members already asked, kept in the list so editing never drops them
 * @return {Promise<FieldOption[]>} - Select options
 */

export const coordinatorOptions = async (
  scope?: AccessScope,
  seated: string[] = []
): Promise<FieldOption[]> => {
  const rows = await prisma.account.findMany({
    where: {
      AND: [
        { OR: [coordinatorWhere(), ...(seated.length > 0 ? [{ id: { in: seated } }] : [])] },
        peopleInScope(scope),
      ],
    },
    orderBy: { displayName: 'asc' },
    include: { ...HELD_FUNCTIONS, youtubers: { select: { id: true } } },
  })

  // An Admin stays an Admin, the function never moves one up
  const holds = (row: (typeof rows)[number]) =>
    !GLOBAL_ROLES.includes(row.role) &&
    row.functions.some((held) => held.jobFunction.name === COORDINATOR_FUNCTION)
  const rankOf = (row: (typeof rows)[number]) =>
    holds(row) ? 0 : (COORDINATOR_RANKS[row.role] ?? 3)

  return [...rows]
    .sort(
      (left, right) =>
        rankOf(left) - rankOf(right) || left.displayName.localeCompare(right.displayName, 'fr')
    )
    .map((row) => ({
      value: row.id,
      label: row.displayName,
      image: row.avatarUrl,
      group: holds(row) ? LIVE_FIELD_COPY.coordinatorGroup : ROLE_REGISTRY.get(row.role).plural,
      // An Admin is proposed whichever creator is picked
      owners: GLOBAL_ROLES.includes(row.role)
        ? undefined
        : row.youtubers.map((youtuber) => youtuber.id),
      hint: toMemberFunctions(row.functions)[0]?.label ?? ROLE_REGISTRY.label(row.role),
    }))
}

// Coordinators proposed for each live
const PROPOSED_COORDINATORS = 2

/**
 * Members proposed as Coordinators for each creator: the holders of the function who coordinated the least recently, nobody absent
 * @param {FieldOption[]} coordinators - Members offered, tied to the creators they cover
 * @return {Promise<Record<string, string[]>>} - Proposed member identifiers by creator
 */

export const coordinatorPicks = async (
  coordinators: FieldOption[]
): Promise<Record<string, string[]>> => {
  const youtuberIds = [...new Set(coordinators.flatMap((option) => option.owners ?? []))]
  const holders = new Map<string, string[]>()

  for (const youtuberId of youtuberIds) {
    const members = await prisma.account.findMany({
      where: {
        AND: [
          holderWhere(youtuberId),
          // Admins are never asked on their own
          { role: { notIn: GLOBAL_ROLES } },
          { absences: { none: activeAbsenceFilter() } },
        ],
      },
      select: { id: true },
    })
    if (members.length)
      holders.set(
        youtuberId,
        members.map((member) => member.id)
      )
  }

  // One read for every creator
  const last = await prisma.liveCoordination.groupBy({
    by: ['accountId'],
    where: { accountId: { in: [...new Set([...holders.values()].flat())] } },
    _max: { askedAt: true },
  })
  const askedAt = new Map(last.map((row) => [row.accountId, row._max.askedAt?.getTime() ?? 0]))
  const picks: Record<string, string[]> = {}

  for (const [youtuberId, ids] of holders) {
    picks[youtuberId] = ids
      .sort((left, right) => (askedAt.get(left) ?? 0) - (askedAt.get(right) ?? 0))
      .slice(0, PROPOSED_COORDINATORS)
  }

  return picks
}

/**
 * Coordinators the creator's live team may name
 * @param {string} youtuberId - Creator
 * @param {string[]} picked - Members named
 * @return {Promise<void>} - Throws on a member that cannot coordinate
 */

export const assertCoordinators = async (youtuberId: string, picked: string[]): Promise<void> => {
  if (picked.length === 0) return

  const allowed = await prisma.account.count({
    where: { AND: [{ id: { in: picked } }, coordinatorWhere(youtuberId)] },
  })
  if (allowed !== picked.length) {
    throw invalidInput([{ field: 'coordinatorIds', message: LIVE_FIELD_COPY.coordinatorRefused }])
  }
}
