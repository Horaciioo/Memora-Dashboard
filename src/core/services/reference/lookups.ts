import 'server-only'

import { cache } from 'react'

import { prisma } from '@/core/lib/db'
import { ENCADREMENT_ROLES } from '@/declarations/access/roles'
import { MemberStatuses } from '@/utils/constants/hierarchy'
import type { Account, Division, JobFunction, Priority, Youtuber } from '@prisma/client'

/**
 * Read the functions a member can be given
 * @return {Promise<JobFunction[]>} - Active functions, in display order
 */

export const activeFunctions = cache(async (): Promise<JobFunction[]> =>
  prisma.jobFunction.findMany({ where: { archived: false }, orderBy: { position: 'asc' } })
)

/**
 * Read the creators still being worked for
 * @return {Promise<Youtuber[]>} - Active creators, in display order
 */

export const activeYoutubers = cache(async (): Promise<Youtuber[]> =>
  prisma.youtuber.findMany({ where: { archived: false }, orderBy: { position: 'asc' } })
)

/**
 * Read encadrement accounts
 * @return {Promise<Account[]>} - Responsables and admins, by name
 */

export const encadrementAccounts = cache(async (): Promise<Account[]> =>
  prisma.account.findMany({
    where: { role: { in: ENCADREMENT_ROLES }, status: { not: MemberStatuses.Left } },
    orderBy: { displayName: 'asc' },
  })
)

/**
 * Read every division, retired ones included
 * @return {Promise<Division[]>} - Divisions, by rank
 */

export const allDivisions = cache(async (): Promise<Division[]> =>
  prisma.division.findMany({ orderBy: { rank: 'asc' } })
)

/**
 * Read every priority, heaviest first
 * @return {Promise<Priority[]>} - Priorities
 */

export const allPriorities = cache(async (): Promise<Priority[]> =>
  prisma.priority.findMany({ orderBy: { weight: 'desc' } })
)
