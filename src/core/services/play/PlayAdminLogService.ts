import 'server-only'

import { prisma } from '@/core/lib/db'
import { PLAY_LOG_EVENTS, PLAY_TARGET } from '@/declarations/play/journal'
import { JOURNAL_LIMITS, JOURNAL_PERIODS } from '@/declarations/system/monitoring/journal'
import type { JournalPeriod } from '@/declarations/system/monitoring/journal'
import type { PlayAdminLog, PlayAdminLogPage, PlayAdminLogStats } from '@/types/play'
import { EVENT_TYPES } from '@/utils/constants/events'
import { DAY_MS, HOUR_MS } from '@/utils/constants/time'
import type { Prisma } from '@prisma/client'

// Events written by the Administration
const ADMIN_EVENTS: number[] = [EVENT_TYPES.ids.PlayAdjusted, EVENT_TYPES.ids.PlayKicked]

// Period when none is chosen
const DEFAULT_PERIOD: JournalPeriod = 'week'

/**
 * Where clause of a Play journal query
 * @param {URLSearchParams} params - Query string: q, period, type, player
 * @return {Prisma.ActivityLogWhereInput} - Where clause
 */

const toWhere = (params: URLSearchParams): Prisma.ActivityLogWhereInput => {
  const period = (params.get('period') ?? DEFAULT_PERIOD) as JournalPeriod
  const hours = JOURNAL_PERIODS[period]?.hours ?? JOURNAL_PERIODS[DEFAULT_PERIOD].hours
  const search = (params.get('q') ?? '').trim().slice(0, JOURNAL_LIMITS.searchLength)
  const type = PLAY_LOG_EVENTS.find((name) => name === params.get('type'))
  const player = params.get('player')

  return {
    targetType: PLAY_TARGET,
    ...(hours && { createdAt: { gte: new Date(Date.now() - hours * HOUR_MS) } }),
    ...(type && { eventType: EVENT_TYPES.ids[type] }),
    ...(player && { subjectId: player }),
    ...(search && {
      OR: [
        { summary: { contains: search, mode: 'insensitive' } },
        { actor: { displayName: { contains: search, mode: 'insensitive' } } },
        { subject: { displayName: { contains: search, mode: 'insensitive' } } },
      ],
    }),
  }
}

/**
 * One page of the Play journal, newest first
 * @param {URLSearchParams} params - Query string: q, period, type, player, page
 * @return {Promise<PlayAdminLogPage>} - Lines and page count
 */

export const readPlayAdminLogPage = async (params: URLSearchParams): Promise<PlayAdminLogPage> => {
  const where = toWhere(params)
  const total = await prisma.activityLog.count({ where })
  const pages = Math.max(1, Math.ceil(total / JOURNAL_LIMITS.pageSize))
  const asked = Number(params.get('page'))
  const page = Math.min(Number.isInteger(asked) && asked > 0 ? asked : 1, pages)

  const rows = await prisma.activityLog.findMany({
    where,
    include: {
      actor: { select: { displayName: true } },
      subject: { select: { displayName: true } },
    },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * JOURNAL_LIMITS.pageSize,
    take: JOURNAL_LIMITS.pageSize,
  })

  const entries: PlayAdminLog[] = rows.map((row) => ({
    id: row.id,
    summary: row.summary,
    eventLabel: EVENT_TYPES.byId(row.eventType)?.label ?? null,
    createdAt: row.createdAt.toISOString(),
    actorName: row.actor?.displayName ?? null,
    subjectId: row.subjectId,
    subjectName: row.subject?.displayName ?? null,
    isAdminAction: ADMIN_EVENTS.includes(row.eventType),
  }))

  return { entries, total, pages, page }
}

/**
 * Figures above the Play journal
 * @return {Promise<PlayAdminLogStats>} - Day and week counts
 */

export const readPlayAdminLogStats = async (): Promise<PlayAdminLogStats> => {
  const now = Date.now()
  const play = { targetType: PLAY_TARGET }
  const week = { gte: new Date(now - 7 * DAY_MS) }

  const [last24h, weekCount, adminWeek] = await Promise.all([
    prisma.activityLog.count({ where: { ...play, createdAt: { gte: new Date(now - DAY_MS) } } }),
    prisma.activityLog.count({ where: { ...play, createdAt: week } }),
    prisma.activityLog.count({
      where: { ...play, createdAt: week, eventType: { in: ADMIN_EVENTS } },
    }),
  ])

  return { last24h, week: weekCount, adminWeek }
}

/**
 * Latest Play journal lines, newest first
 * @return {Promise<PlayAdminLog[]>} - First page of lines
 */

export const readPlayAdminLogs = async (): Promise<PlayAdminLog[]> =>
  (await readPlayAdminLogPage(new URLSearchParams())).entries
