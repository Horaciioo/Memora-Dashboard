import 'server-only'
import { prisma } from '@/core/lib/db'
import { addDays, endOfDay, startOfDay } from '@/utils/format/time/days'
import { scopedWhere } from '@/core/services/auth/ScopeService'
import { CALENDAR_PROJECTION_COPY } from '@/declarations/calendar/copy'
import { CANDIDATE_COPY } from '@/declarations/recruitment/candidateCopy'
import { ROUTES } from '@/declarations/navigation'
import type { CalendarEntry } from '@/types/calendar'
import { Permissions } from '@/utils/constants/permissions'
import { CalendarKinds, CalendarSources } from '@/utils/constants/workflow'
import { projected } from '@/core/services/calendar/projections/shared'
import type { ProjectionContext } from '@/core/services/calendar/projections/shared'
import { WRITTEN_PHASE_DAYS } from '@/core/services/calendar/projections/academy'

/**
 * Project the recruitment campaigns open in the window
 * @param {ProjectionContext} context - Window and permissions
 * @return {Promise<CalendarEntry[]>} - Projected sessions and interviews
 */

export const recruitmentEntries = async ({
  from,
  to,
  access,
  scope,
  viewer,
}: ProjectionContext): Promise<CalendarEntry[]> => {
  const canRead = access.can(Permissions.RecruitmentRead)
  const seated = {
    OR: [
      { recruiters: { some: { accountId: viewer.id } } },
      { observers: { some: { accountId: viewer.id } } },
    ],
  }

  const [sessions, candidates] = await Promise.all([
    // Campaigns are for readers
    !canRead
      ? []
      : prisma.recruitmentSession.findMany({
          where: scopedWhere('recruitmentSession', scope, {
            opensAt: { not: null, lte: to },
            OR: [{ closesAt: { gte: from } }, { closesAt: null, opensAt: { gte: from } }],
          }),
          include: { youtuber: { select: { accent: true } } },
          orderBy: { opensAt: 'asc' },
        }),
    prisma.recruitmentCandidate.findMany({
      where: {
        interviewAt: { gte: from, lte: to },
        // Anyone else sees the interviews they sit in
        ...(canRead ? { session: scopedWhere('recruitmentSession', scope) } : seated),
      },
      include: {
        session: { select: { id: true, youtuberId: true, youtuber: { select: { accent: true } } } },
        recruiters: { select: { accountId: true } },
        observers: { select: { accountId: true } },
      },
      orderBy: { interviewAt: 'asc' },
    }),
  ])

  // The first week reads the written interviews, the rest of the campaign the oral ones
  const campaigns = sessions.flatMap((row) => {
    const opensAt = row.opensAt as Date
    const writtenEnd = endOfDay(addDays(opensAt, WRITTEN_PHASE_DAYS - 1))
    const hasOral = row.closesAt !== null && row.closesAt > writtenEnd
    const phase = (key: string, label: string, startsAt: Date, endsAt: Date) =>
      projected({
        source: CalendarSources.Recruitment,
        id: `${row.id}:${key}`,
        title: `${label}, ${row.name}`,
        startsAt,
        endsAt,
        allDay: true,
        kind: CalendarKinds.Zone,
        accent: row.youtuber.accent,
        youtuberId: row.youtuberId,
        description: row.summary,
        subjectName: null,
        href: ROUTES.recruitment(row.id),
      })

    return [
      phase(
        'written',
        CALENDAR_PROJECTION_COPY.writtenPhase,
        opensAt,
        hasOral ? writtenEnd : (row.closesAt ?? writtenEnd)
      ),
      ...(hasOral
        ? [
            phase(
              'oral',
              CALENDAR_PROJECTION_COPY.oralPhase,
              startOfDay(addDays(opensAt, WRITTEN_PHASE_DAYS)),
              row.closesAt as Date
            ),
          ]
        : []),
    ]
  })

  const interviews = candidates.map((row) => {
    // A reader's own interviews are told apart, an observer never sees who it is
    const name = canRead
      ? (row.displayName ?? row.discordId)
      : (row.displayName ?? CANDIDATE_COPY.anonymous)

    return projected({
      source: CalendarSources.RecruitmentInterview,
      id: row.id,
      title: `${CALENDAR_PROJECTION_COPY.interview}, ${name}`,
      startsAt: row.interviewAt as Date,
      endsAt: null,
      allDay: false,
      accent: row.session.youtuber.accent,
      youtuberId: row.session.youtuberId,
      description: null,
      subjectName: canRead ? row.displayName : null,
      href: ROUTES.candidate(row.session.id, row.id),
      mine: [...row.recruiters, ...row.observers].some((seat) => seat.accountId === viewer.id),
    })
  })

  return [...campaigns, ...interviews]
}
