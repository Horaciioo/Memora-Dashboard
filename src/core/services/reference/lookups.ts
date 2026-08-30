import 'server-only'

import { cache } from 'react'

import { prisma } from '@/core/lib/db'
import type { Division, JobFunction, Priority, Youtuber } from '@prisma/client'

/**
 * Reference rows change once a month and are read several times per render,
 * so every reader here is memoised for the length of one render. Anything
 * narrowed by a perimeter or a filter stays with its own service
 */

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
