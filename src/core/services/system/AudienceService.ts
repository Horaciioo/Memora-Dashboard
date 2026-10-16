import 'server-only'

import { prisma } from '@/core/lib/db'
import { AUDIENCE_COPY, AUDIENCE_WINDOWS } from '@/declarations/system/monitoring/activity'
import { EVENT_ORIGINS, EVENT_TYPES } from '@/utils/constants/events'
import { readDevice } from '@/utils/format/device'

// Milliseconds in one day
const DAY_MS = 86_400_000

/**
 * Members active on one day
 * @typedef {Object} AudienceDay
 * @property {string} day - ISO date
 * @property {number} active - Distinct members
 * @property {number} logins - Sign-ins
 */

export interface AudienceDay {
  day: string
  active: number
  logins: number
}

/**
 * One counted label
 * @typedef {Object} AudienceShare
 * @property {string} label - Name
 * @property {number} count - Count
 */

export interface AudienceShare {
  label: string
  count: number
}

/**
 * Audience report
 * @typedef {Object} AudienceReport
 * @property {number} activeDay - Active in a day
 * @property {number} activeWeek - Active in a week
 * @property {number} activeMonth - Active in a month
 * @property {number} logins - Sign-ins in a week
 * @property {number} sessions - Open sessions
 * @property {AudienceDay[]} days - Daily series, oldest first
 * @property {AudienceShare[]} browsers - Browser split
 * @property {AudienceShare[]} systems - System split
 * @property {number} handhelds - Sessions on mobile
 * @property {AudienceShare[]} top - Busiest members
 */

export interface AudienceReport {
  activeDay: number
  activeWeek: number
  activeMonth: number
  logins: number
  sessions: number
  days: AudienceDay[]
  browsers: AudienceShare[]
  systems: AudienceShare[]
  handhelds: number
  top: AudienceShare[]
}

// Members who did something since a date
const distinctActors = async (since: Date): Promise<number> =>
  (
    await prisma.activityLog.groupBy({
      by: ['actorId'],
      where: { actorId: { not: null }, origin: EVENT_ORIGINS.ids.User, createdAt: { gte: since } },
    })
  ).length

// Counted labels, biggest first
const share = (labels: (string | null)[]): AudienceShare[] =>
  Object.entries(Object.groupBy(labels, (label) => label ?? AUDIENCE_COPY.unknown))
    .map(([label, items]) => ({ label, count: items?.length ?? 0 }))
    .sort((a, b) => b.count - a.count)

/**
 * Read who uses Memora
 * @return {Promise<AudienceReport>} - Audience report
 */

export const readAudience = async (): Promise<AudienceReport> => {
  const now = Date.now()
  const since = new Date(now - AUDIENCE_WINDOWS.days * DAY_MS)

  const [activeDay, activeWeek, activeMonth, logins, sessions, rows, open, grouped] =
    await Promise.all([
      distinctActors(new Date(now - DAY_MS)),
      distinctActors(new Date(now - 7 * DAY_MS)),
      distinctActors(since),
      prisma.activityLog.count({
        where: {
          eventType: EVENT_TYPES.ids.SessionOpened,
          createdAt: { gte: new Date(now - 7 * DAY_MS) },
        },
      }),
      prisma.session.count({ where: { expiresAt: { gt: new Date() } } }),
      prisma.$queryRaw<{ day: Date; active: bigint; logins: bigint }[]>`
        SELECT date_trunc('day', "createdAt" AT TIME ZONE 'Europe/Paris') AS day,
          count(DISTINCT "actorId") AS active,
          count(*) FILTER (WHERE "eventType" = ${EVENT_TYPES.ids.SessionOpened}) AS logins
        FROM activity_logs
        WHERE "createdAt" >= ${since} AND "actorId" IS NOT NULL AND origin = ${EVENT_ORIGINS.ids.User}
        GROUP BY 1 ORDER BY 1`,
      prisma.session.findMany({
        where: { expiresAt: { gt: new Date() } },
        select: { userAgent: true },
        take: AUDIENCE_WINDOWS.sessionsRead,
      }),
      prisma.activityLog.groupBy({
        by: ['actorId'],
        where: {
          actorId: { not: null },
          origin: EVENT_ORIGINS.ids.User,
          createdAt: { gte: since },
        },
        _count: { _all: true },
        orderBy: { _count: { actorId: 'desc' } },
        take: AUDIENCE_WINDOWS.topMembers,
      }),
    ])

  // Missing days count as zero
  const byDay = new Map(rows.map((row) => [row.day.toISOString().slice(0, 10), row]))
  const days = Array.from({ length: AUDIENCE_WINDOWS.days }, (_, index) => {
    const day = new Date(now - (AUDIENCE_WINDOWS.days - 1 - index) * DAY_MS)
      .toISOString()
      .slice(0, 10)
    const row = byDay.get(day)

    return { day, active: Number(row?.active ?? 0), logins: Number(row?.logins ?? 0) }
  })

  // Devices of open sessions
  const devices = open.map((session) => readDevice(session.userAgent))

  // Names of the busiest members
  const accounts = await prisma.account.findMany({
    where: { id: { in: grouped.flatMap((row) => (row.actorId ? [row.actorId] : [])) } },
    select: { id: true, displayName: true },
  })
  const names = new Map(accounts.map((account) => [account.id, account.displayName]))

  return {
    activeDay,
    activeWeek,
    activeMonth,
    logins,
    sessions,
    days,
    browsers: share(devices.map((device) => device.browser)),
    systems: share(devices.map((device) => device.system)),
    handhelds: devices.filter((device) => device.isMobile).length,
    top: grouped.map((row) => ({
      label: names.get(row.actorId ?? '') ?? AUDIENCE_COPY.unknown,
      count: row._count._all,
    })),
  }
}
