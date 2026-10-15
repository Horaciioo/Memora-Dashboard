import 'server-only'

import { prisma } from '@/core/lib/db'
import type { ActivityFilters } from '@/core/lib/system/activityFilters'
import { toEntry } from '@/core/services/system/ActivityService'
import type { ActivityEntry } from '@/core/services/system/ActivityService'
import { JOURNAL_LIMITS, JOURNAL_PERIODS } from '@/declarations/system/journal'
import { EVENT_ORIGINS, EVENT_TYPES, LOG_LEVELS } from '@/utils/constants/events'
import type { Prisma } from '@prisma/client'

// Milliseconds in one hour
const HOUR_MS = 3_600_000

// Actor columns every read needs
const WITH_ACTOR = { actor: { select: { displayName: true, avatarUrl: true } } } as const

/**
 * Page of the journal
 * @typedef {Object} ActivityPage
 * @property {ActivityEntry[]} entries - Entries of the page
 * @property {number} total - Matching entries
 * @property {number} pages - Page count
 * @property {number} page - Page shown
 */

export interface ActivityPage {
  entries: ActivityEntry[]
  total: number
  pages: number
  page: number
}

/**
 * Journal figures
 * @typedef {Object} ActivityStats
 * @property {number} last24h - Entries in a day
 * @property {number} warnings - Warnings in a day
 * @property {number} errors - Errors in a day
 * @property {string | null} lastError - ISO moment of the last error
 * @property {{ id: string, name: string }[]} actors - Members who acted lately
 */

export interface ActivityStats {
  last24h: number
  warnings: number
  errors: number
  lastError: string | null
  actors: { id: string; name: string }[]
}

/**
 * Prisma filter of a set of filters
 * @param {ActivityFilters} filters - Journal filters
 * @return {Prisma.ActivityLogWhereInput} - Where clause
 */

export const toWhere = (filters: ActivityFilters): Prisma.ActivityLogWhereInput => {
  const hours = JOURNAL_PERIODS[filters.period].hours
  const { search } = filters

  return {
    ...(filters.level && { level: LOG_LEVELS.ids[filters.level] }),
    ...(filters.event && { eventType: EVENT_TYPES.ids[filters.event] }),
    ...(filters.origin && { origin: EVENT_ORIGINS.ids[filters.origin] }),
    ...(filters.actor && { actorId: filters.actor }),
    ...(hours && { createdAt: { gte: new Date(Date.now() - hours * HOUR_MS) } }),
    ...(search && {
      OR: [
        { summary: { contains: search, mode: 'insensitive' } },
        { route: { contains: search, mode: 'insensitive' } },
        { ip: { contains: search } },
        { targetId: search },
        { actor: { displayName: { contains: search, mode: 'insensitive' } } },
      ],
    }),
  }
}

/**
 * Read one page of the journal
 * @param {ActivityFilters} filters - Journal filters
 * @return {Promise<ActivityPage>} - Page and totals
 */

export const readActivityPage = async (filters: ActivityFilters): Promise<ActivityPage> => {
  const where = toWhere(filters)
  const total = await prisma.activityLog.count({ where })

  // Page clamped to what exists
  const pages = Math.max(1, Math.ceil(total / JOURNAL_LIMITS.pageSize))
  const page = Math.min(filters.page, pages)

  const rows = await prisma.activityLog.findMany({
    where,
    include: WITH_ACTOR,
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * JOURNAL_LIMITS.pageSize,
    take: JOURNAL_LIMITS.pageSize,
  })

  return { entries: rows.map(toEntry), total, pages, page }
}

/**
 * Read every match for an export
 * @param {ActivityFilters} filters - Journal filters
 * @return {Promise<ActivityEntry[]>} - Entries, capped
 */

export const readActivityExport = async (filters: ActivityFilters): Promise<ActivityEntry[]> => {
  const rows = await prisma.activityLog.findMany({
    where: toWhere(filters),
    include: WITH_ACTOR,
    orderBy: { createdAt: 'desc' },
    take: JOURNAL_LIMITS.exportRows,
  })

  return rows.map(toEntry)
}

/**
 * Read the figures above the journal
 * @return {Promise<ActivityStats>} - Day figures and actors
 */

export const readActivityStats = async (): Promise<ActivityStats> => {
  const since = new Date(Date.now() - 24 * HOUR_MS)
  const month = new Date(Date.now() - 30 * 24 * HOUR_MS)

  const [last24h, warnings, errors, lastError, grouped] = await Promise.all([
    prisma.activityLog.count({ where: { createdAt: { gte: since } } }),
    prisma.activityLog.count({
      where: { createdAt: { gte: since }, level: LOG_LEVELS.ids.Warning },
    }),
    prisma.activityLog.count({ where: { createdAt: { gte: since }, level: LOG_LEVELS.ids.Error } }),
    prisma.activityLog.findFirst({
      where: { level: LOG_LEVELS.ids.Error },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    }),
    prisma.activityLog.groupBy({
      by: ['actorId'],
      where: { actorId: { not: null }, createdAt: { gte: month } },
      _count: { _all: true },
      orderBy: { _count: { actorId: 'desc' } },
      take: JOURNAL_LIMITS.actorChoices,
    }),
  ])

  // Names of the members who acted
  const ids = grouped.flatMap((row) => (row.actorId ? [row.actorId] : []))
  const accounts = await prisma.account.findMany({
    where: { id: { in: ids } },
    select: { id: true, displayName: true },
    orderBy: { displayName: 'asc' },
  })

  return {
    last24h,
    warnings,
    errors,
    lastError: lastError?.createdAt.toISOString() ?? null,
    actors: accounts.map((account) => ({ id: account.id, name: account.displayName })),
  }
}
