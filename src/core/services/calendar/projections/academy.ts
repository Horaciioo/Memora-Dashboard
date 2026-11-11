import 'server-only'
import { prisma } from '@/core/lib/db'
import { periodZones, promotionPeriods, toPeriodInput } from '@/core/lib/academy/periods'
import { sessionNumbers } from '@/core/services/academy/AcademyService'
import { PIM_PERIOD_REGISTRY } from '@/declarations/academy/timeline'
import { CALENDAR_PROJECTION_COPY } from '@/declarations/calendar/copy'
import { ROUTES } from '@/declarations/navigation'
import type { CalendarEntry } from '@/types/calendar'
import { AcademySessionStatuses } from '@/utils/constants/hierarchy'
import { Permissions } from '@/utils/constants/permissions'
import { sessionTitle } from '@/utils/format/academy'
import { CalendarKinds, CalendarSources } from '@/utils/constants/workflow'
import { projected } from '@/core/services/calendar/projections/shared'
import type { ProjectionContext } from '@/core/services/calendar/projections/shared'

/**
 * Project the running length of every academy session in the window
 * @param {ProjectionContext} context - Window and permissions
 * @return {Promise<CalendarEntry[]>} - Projected sessions
 */

export const academySessionEntries = async ({
  from,
  to,
  access,
}: ProjectionContext): Promise<CalendarEntry[]> => {
  // Everyone sees the length, only Academy readers open it
  const canOpen = access.can(Permissions.AcademyRead)

  const rows = await prisma.academySession.findMany({
    where: {
      startsAt: { lte: to },
      OR: [{ endsAt: { gte: from } }, { endsAt: null, startsAt: { gte: from } }],
    },
    include: { jobFunction: { select: { name: true, accent: true } } },
    orderBy: { startsAt: 'asc' },
  })

  return rows.map((row) =>
    projected({
      source: CalendarSources.AcademySession,
      id: row.id,
      title: `${CALENDAR_PROJECTION_COPY.academySession}, ${row.jobFunction.name}`,
      startsAt: row.startsAt,
      endsAt: row.endsAt ?? row.startsAt,
      allDay: true,
      kind: CalendarKinds.Period,
      accent: row.jobFunction.accent,
      description: canOpen ? row.summary : null,
      subjectName: null,
      href: canOpen ? ROUTES.session(row.id) : undefined,
    })
  )
}

// Days the written interviews run from the opening of a campaign
export const WRITTEN_PHASE_DAYS = 7

// Source each part of a period is drawn from
const ZONE_SOURCES = {
  period: CalendarSources.AcademyPeriod,
  trainings: CalendarSources.AcademyTrainings,
  reviews: CalendarSources.AcademyReviews,
} as const

/**
 * Project the periods, trainings and review windows of running promotions as zones
 * @param {ProjectionContext} context - Window and permissions
 * @param {string} [sessionId] - Promotion the board is bound to
 * @return {Promise<CalendarEntry[]>} - Zones
 */

export const academyZoneEntries = async (
  { from, to, access }: ProjectionContext,
  sessionId?: string
): Promise<CalendarEntry[]> => {
  // Everyone sees the zones, only Academy readers open them
  const canOpen = access.can(Permissions.AcademyRead)

  const rows = await prisma.academySession.findMany({
    where: {
      ...(sessionId ? { id: sessionId } : {}),
      status: { in: [AcademySessionStatuses.Running, AcademySessionStatuses.Closed] },
      startsAt: { lte: to },
    },
    include: {
      jobFunction: { select: { name: true } },
      juniors: {
        select: {
          reviewOneDueAt: true,
          reviewFinalDueAt: true,
          deadlineAt: true,
          reviews: { select: { stage: true, status: true, decision: true, decidedAt: true } },
        },
      },
    },
    orderBy: { startsAt: 'asc' },
  })
  const numbers = await sessionNumbers()

  const zones = rows.flatMap((row) => {
    const title = sessionTitle({ function: row.jobFunction, number: numbers.get(row.id) ?? 1 })
    const periods = promotionPeriods(toPeriodInput(row))

    return periods.flatMap((period) => {
      const option = PIM_PERIOD_REGISTRY.get(period.key)

      return periodZones(period, option.hasTrainings).map((zone) => {
        const label =
          zone.part === 'period'
            ? option.label
            : zone.part === 'trainings'
              ? CALENDAR_PROJECTION_COPY.trainingsZone
              : CALENDAR_PROJECTION_COPY.reviewsZone

        return projected({
          source: ZONE_SOURCES[zone.part],
          id: `${row.id}:${period.key}:${zone.part}`,
          title: `${label}, ${title}`,
          startsAt: zone.from,
          endsAt: zone.to ?? row.endsAt ?? to,
          allDay: true,
          kind: CalendarKinds.Zone,
          accent: zone.part === 'period' ? option.tone : null,
          description: null,
          subjectName: null,
          href: canOpen ? ROUTES.session(row.id) : undefined,
        })
      })
    })
  })

  // A zone still on screen merely overlaps the window
  return zones.filter((zone) => new Date(zone.endsAt ?? zone.startsAt) >= from)
}
