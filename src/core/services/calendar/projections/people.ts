import 'server-only'
import { prisma } from '@/core/lib/db'
import { activeAbsenceFilter } from '@/core/services/absences/AbsenceService'
import { endOfDay, startOfDay } from '@/utils/format/time/days'
import { scopedWhere } from '@/core/services/auth/ScopeService'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { CALENDAR_PROJECTION_COPY } from '@/declarations/calendar/copy'
import type { CalendarEntry } from '@/types/calendar'
import { Permissions } from '@/utils/constants/permissions'
import { AbsenceStatuses, CalendarKinds, CalendarSources } from '@/utils/constants/workflow'
import { DAY_MS } from '@/utils/constants/time'
import {
  FUNCTION_SHAPE,
  creatorAccent,
  creatorId,
  projected,
} from '@/core/services/calendar/projections/shared'
import type { ProjectionContext } from '@/core/services/calendar/projections/shared'

/**
 * Project the absences overlapping the window
 * @param {ProjectionContext} context - Window and permissions
 * @return {Promise<CalendarEntry[]>} - Projected absences
 */

export const absenceEntries = async ({
  from,
  to,
  access,
}: ProjectionContext): Promise<CalendarEntry[]> => {
  if (!access.can(Permissions.AbsenceRead)) return []

  // A pending absence is only a request
  const statuses = access.can(Permissions.AbsenceReview)
    ? [AbsenceStatuses.Approved, AbsenceStatuses.Pending]
    : [AbsenceStatuses.Approved]

  const rows = await prisma.absence.findMany({
    where: { ...activeAbsenceFilter(from, to), status: { in: statuses } },
    include: { account: FUNCTION_SHAPE },
    orderBy: { startDate: 'asc' },
  })

  return rows.map((row) =>
    projected({
      source: CalendarSources.Absence,
      id: row.id,
      title: `${
        row.status === AbsenceStatuses.Pending
          ? CALENDAR_PROJECTION_COPY.pendingAbsence
          : CALENDAR_PROJECTION_COPY.absence
      }, ${row.account.displayName}`,
      startsAt: row.startDate,
      endsAt: row.endDate,
      allDay: true,
      // An absence is background information
      kind: CalendarKinds.Event,
      muted: true,
      accent: null,
      youtuberId: creatorId(row.account),
      description: row.reason,
      subjectName: row.account.displayName,
    })
  )
}

/**
 * One celebrated birthday landing inside a window
 * @typedef {Object} BirthdayOccurrence
 * @property {string} accountId - Member identifier
 * @property {string} displayName - Member name
 * @property {string | null} avatarUrl - Member portrait
 * @property {Date} day - Day it falls on
 * @property {string | null} accent - Creator colour
 * @property {string | null} youtuberId - Creator it belongs to
 */

export interface BirthdayOccurrence {
  accountId: string
  displayName: string
  avatarUrl: string | null
  day: Date
  accent: string | null
  youtuberId: string | null
}

/**
 * Read the celebrated birthdays of a window
 * @param {Date} from - First moment
 * @param {Date} to - Last moment
 * @param {AccessScope} scope - Creator perimeter
 * @return {Promise<BirthdayOccurrence[]>} - Occurrences
 */

export const birthdaysBetween = async (
  from: Date,
  to: Date,
  scope: AccessScope
): Promise<BirthdayOccurrence[]> => {
  /*
   * Postgres narrows the candidates
   */

  const dayKey = (date: Date): number => (date.getMonth() + 1) * 100 + date.getDate()

  // Widened by a day each side
  const fromKey = dayKey(new Date(from.getTime() - DAY_MS))
  const toKey = dayKey(new Date(to.getTime() + DAY_MS))

  const candidates = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM accounts
    WHERE birthday IS NOT NULL
      AND "celebrateBirthday" = true
      AND "leftAt" IS NULL
      AND CASE
        WHEN ${fromKey} <= ${toKey}
          THEN (EXTRACT(MONTH FROM birthday) * 100 + EXTRACT(DAY FROM birthday))
               BETWEEN ${fromKey} AND ${toKey}
        ELSE (EXTRACT(MONTH FROM birthday) * 100 + EXTRACT(DAY FROM birthday)) >= ${fromKey}
          OR (EXTRACT(MONTH FROM birthday) * 100 + EXTRACT(DAY FROM birthday)) <= ${toKey}
      END
  `

  if (candidates.length === 0) return []

  const rows = await prisma.account.findMany({
    where: scopedWhere('account', scope, { id: { in: candidates.map((row) => row.id) } }),
    select: { id: true, birthday: true, avatarUrl: true, ...FUNCTION_SHAPE.select },
  })

  const start = startOfDay(new Date(from))
  const end = endOfDay(new Date(to))

  return rows
    .flatMap((row) => {
      const birthday = row.birthday as Date

      // A window can straddle a new year
      return [start.getFullYear(), end.getFullYear()]
        .filter((year, index, years) => years.indexOf(year) === index)
        .map((year) => new Date(year, birthday.getMonth(), birthday.getDate()))
        .filter((day) => day >= start && day <= end)
        .map((day) => ({
          accountId: row.id,
          displayName: row.displayName,
          avatarUrl: row.avatarUrl,
          day,
          accent: creatorAccent(row),
          youtuberId: creatorId(row),
        }))
    })
    .sort((left, right) => left.day.getTime() - right.day.getTime())
}

/**
 * Project the birthdays falling inside the window
 * @param {ProjectionContext} context - Window and permissions
 * @return {Promise<CalendarEntry[]>} - Projected birthdays
 */

export const birthdayEntries = async ({
  from,
  to,
  access,
  scope,
}: ProjectionContext): Promise<CalendarEntry[]> => {
  if (!access.can(Permissions.MemberRead)) return []

  const occurrences = await birthdaysBetween(from, to, scope)

  return occurrences.map((occurrence) =>
    projected({
      source: CalendarSources.Birthday,
      id: `${occurrence.accountId}:${occurrence.day.getFullYear()}`,
      title: `${CALENDAR_PROJECTION_COPY.birthday}, ${occurrence.displayName}`,
      startsAt: occurrence.day,
      endsAt: null,
      allDay: true,
      accent: occurrence.accent,
      youtuberId: occurrence.youtuberId,
      description: null,
      subjectName: occurrence.displayName,
    })
  )
}
