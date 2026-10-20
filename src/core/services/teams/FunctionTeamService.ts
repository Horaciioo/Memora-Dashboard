import 'server-only'

import { prisma } from '@/core/lib/db'
import { ENCADREMENT_ROLES } from '@/declarations/access/roles'
import { tradeOfFunction } from '@/declarations/reference/fixed'
import { AccessCategories, GONE_MEMBER_STATUSES } from '@/utils/constants/hierarchy'

// Functions that make a team at a creator, the juniors sit in the team of their trade
const TEAM_FUNCTIONS = { archived: false, category: AccessCategories.Moderation }

/**
 * Open the functions of a creator, one team standing for each of them
 * @param {string} youtuberId - Creator identifier
 * @param {string[]} functionIds - Functions kept open
 * @return {Promise<void>} - Written, members seated
 */

export const openCreatorFunctions = async (
  youtuberId: string,
  functionIds: string[]
): Promise<void> => {
  const wanted = new Set(functionIds)
  const functions = await prisma.jobFunction.findMany({ where: { archived: false } })

  await prisma.$transaction([
    prisma.youtuberFunction.deleteMany({
      where: { youtuberId, functionId: { notIn: wanted.size > 0 ? [...wanted] : [''] } },
    }),
    ...functions
      .filter((entry) => wanted.has(entry.id))
      .map((entry, position) =>
        prisma.youtuberFunction.upsert({
          where: { youtuberId_functionId: { youtuberId, functionId: entry.id } },
          update: { position },
          create: { youtuberId, functionId: entry.id, position },
        })
      ),
    // One team per function that can be one, archived when closed
    ...functions
      .filter((entry) => entry.category === TEAM_FUNCTIONS.category)
      .map((entry) =>
        prisma.team.upsert({
          where: { youtuberId_functionId: { youtuberId, functionId: entry.id } },
          update: { archived: !wanted.has(entry.id) },
          create: {
            name: entry.name,
            youtuberId,
            functionId: entry.id,
            archived: !wanted.has(entry.id),
          },
        })
      ),
  ])

  const seated = await prisma.account.findMany({
    where: { youtubers: { some: { id: youtuberId } } },
    select: { id: true },
  })
  await syncFunctionTeams(seated.map((account) => account.id))
}

/**
 * Open every function of a creator, what a new creator starts with
 * @param {string} youtuberId - Creator identifier
 * @return {Promise<void>} - Written
 */

export const openEveryFunction = async (youtuberId: string): Promise<void> => {
  const functions = await prisma.jobFunction.findMany({
    where: { archived: false },
    select: { id: true },
  })

  await openCreatorFunctions(
    youtuberId,
    functions.map((entry) => entry.id)
  )
}

/**
 * Open a function no creator has yet, a function new to the code starts open everywhere
 * @return {Promise<void>} - Written
 */

export const openNewFunctions = async (): Promise<void> => {
  const [functions, creators, seats] = await Promise.all([
    prisma.jobFunction.findMany({ where: { archived: false } }),
    prisma.youtuber.findMany({ select: { id: true } }),
    prisma.youtuberFunction.findMany({ select: { functionId: true } }),
  ])

  const known = new Set(seats.map((seat) => seat.functionId))
  const fresh = functions.filter((entry) => !known.has(entry.id))

  await prisma.$transaction(
    creators.flatMap((creator) =>
      fresh.flatMap((entry) => [
        prisma.youtuberFunction.upsert({
          where: { youtuberId_functionId: { youtuberId: creator.id, functionId: entry.id } },
          update: {},
          create: { youtuberId: creator.id, functionId: entry.id, position: entry.position },
        }),
        ...(entry.category === TEAM_FUNCTIONS.category
          ? [
              prisma.team.upsert({
                where: { youtuberId_functionId: { youtuberId: creator.id, functionId: entry.id } },
                update: {},
                create: { name: entry.name, youtuberId: creator.id, functionId: entry.id },
              }),
            ]
          : []),
      ])
    )
  )
}

/**
 * Seat each member in the team of every function they hold at their creators
 * A junior sits in the team of the trade they train for, the team follows the functions alone
 * @param {string[]} [accountIds] - Members to settle, everyone when left out
 * @return {Promise<void>} - Memberships rewritten
 */

export const syncFunctionTeams = async (accountIds?: string[]): Promise<void> => {
  if (accountIds && accountIds.length === 0) return

  const [teams, functions, accounts] = await Promise.all([
    prisma.team.findMany({
      where: { functionId: { not: null }, archived: false },
      select: { id: true, youtuberId: true, functionId: true },
    }),
    prisma.jobFunction.findMany({ select: { id: true, name: true } }),
    prisma.account.findMany({
      where: {
        ...(accountIds ? { id: { in: accountIds } } : {}),
        role: { notIn: ENCADREMENT_ROLES },
        status: { notIn: GONE_MEMBER_STATUSES },
      },
      select: {
        id: true,
        youtubers: { select: { id: true } },
        functions: { select: { jobFunction: { select: { name: true } } } },
      },
    }),
  ])

  const teamOf = new Map(teams.map((team) => [`${team.youtuberId}:${team.functionId}`, team.id]))
  const idOf = new Map(functions.map((entry) => [entry.name, entry.id]))

  // Teams every member should be in
  const wanted = new Map<string, Set<string>>()
  for (const account of accounts) {
    const seats = new Set<string>()

    for (const held of account.functions) {
      const trade = idOf.get(tradeOfFunction(held.jobFunction.name))

      for (const youtuber of account.youtubers) {
        const team = trade ? teamOf.get(`${youtuber.id}:${trade}`) : undefined
        if (team) seats.add(team)
      }
    }
    wanted.set(account.id, seats)
  }

  const settled = [...wanted.keys()]
  const current = await prisma.teamMember.findMany({
    where: { accountId: { in: settled }, team: { functionId: { not: null } } },
    select: { id: true, accountId: true, teamId: true },
  })

  const stale = current.filter((seat) => !wanted.get(seat.accountId)?.has(seat.teamId))
  const known = new Set(current.map((seat) => `${seat.accountId}:${seat.teamId}`))
  const missing = [...wanted].flatMap(([accountId, seats]) =>
    [...seats]
      .filter((teamId) => !known.has(`${accountId}:${teamId}`))
      .map((teamId) => ({ accountId, teamId }))
  )

  await prisma.$transaction([
    prisma.teamMember.deleteMany({ where: { id: { in: stale.map((seat) => seat.id) } } }),
    prisma.teamMember.createMany({ data: missing, skipDuplicates: true }),
  ])
}
