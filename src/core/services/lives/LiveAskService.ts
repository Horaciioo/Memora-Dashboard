import 'server-only'

import type { Prisma } from '@prisma/client'

import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import { activeAbsenceFilter } from '@/core/services/absences/AbsenceService/shape'
import { readRosterFor } from '@/core/services/calendar/attendance/roster'
import type { LiveAsk, LiveDeclared, LiveGroups } from '@/types/liveAsks'
import { OPEN_LIVE_STATUSES } from '@/utils/constants/lives'
import { AttendanceStatuses } from '@/utils/constants/workflow'

// How far back a declaration still counts as news
const NEWS_HOURS = 12

// Live behind a roll-call, with its creator, when it is still to come or running
const openLive: Prisma.LiveWhereInput = { status: { in: [...OPEN_LIVE_STATUSES] } }

/**
 * Roll-calls waiting on a member, lives and other events, unanswered
 * @param {string} accountId - Member
 * @return {Promise<LiveAsk[]>} - One per event, soonest first
 */

export const myLiveAsks = async (accountId: string): Promise<LiveAsk[]> => {
  const rows = await prisma.eventAttendance.findMany({
    where: {
      accountId,
      status: AttendanceStatuses.Pending,
      event: {
        rollCall: true,
        // A live is open by its status, any other event while it lasts
        OR: [{ live: { is: openLive } }, { live: { is: null }, endsAt: { gt: new Date() } }],
      },
    },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          startsAt: true,
          endsAt: true,
          live: { select: { id: true, youtuber: { select: { name: true } } } },
        },
      },
    },
    orderBy: { event: { startsAt: 'asc' } },
  })

  return rows.map((row) => ({
    eventId: row.event.id,
    liveId: row.event.live?.id ?? '',
    title: row.event.title,
    creator: row.event.live?.youtuber.name ?? '',
    startsAt: row.event.startsAt.toISOString(),
    endsAt: row.event.endsAt?.toISOString() ?? null,
  }))
}

/**
 * Members who just said they come to a live, for the ones who run it
 * @param {string} viewerId - Responsable or Référent reading
 * @return {Promise<LiveDeclared[]>} - Latest first
 */

export const declaredPresences = async (viewerId: string): Promise<LiveDeclared[]> => {
  const since = new Date(Date.now() - NEWS_HOURS * 3_600_000)
  const rows = await prisma.eventAttendance.findMany({
    where: {
      status: AttendanceStatuses.Present,
      accountId: { not: viewerId },
      respondedAt: { gte: since },
      event: { rollCall: true, live: { is: openLive } },
    },
    include: {
      account: { select: { displayName: true } },
      event: {
        select: { id: true, title: true, live: { select: { id: true } } },
      },
    },
    orderBy: { respondedAt: 'desc' },
    take: 20,
  })

  return rows.flatMap((row) =>
    row.event.live && row.respondedAt
      ? [
          {
            key: `${row.eventId}:${row.accountId}:${row.respondedAt.getTime()}`,
            eventId: row.event.id,
            liveId: row.event.live.id,
            title: row.event.title,
            name: row.account.displayName,
            from: row.availableFrom?.toISOString() ?? null,
            to: row.availableTo?.toISOString() ?? null,
          },
        ]
      : []
  )
}

/**
 * Who answered what on one live, with the ones on declared leave set apart
 * @param {string} eventId - Roll-call event of the live
 * @param {string} viewerId - Responsable or Référent reading
 * @return {Promise<LiveGroups>} - Four groups of people
 */

export const liveGroups = async (eventId: string, viewerId: string): Promise<LiveGroups> => {
  const event = await prisma.calendarEvent.findUnique({
    where: { id: eventId },
    select: { startsAt: true, endsAt: true, title: true, live: { select: { id: true } } },
  })
  if (!event?.live) throw notFound()

  const roster = await readRosterFor(eventId, viewerId, true)
  const unanswered = [...roster.absent, ...roster.pending]
  const away = await prisma.absence.findMany({
    where: {
      accountId: { in: unanswered.map((person) => person.id) },
      ...activeAbsenceFilter(event.startsAt, event.endsAt ?? event.startsAt),
    },
    select: { accountId: true },
  })
  const onLeave = new Set(away.map((row) => row.accountId))

  return {
    title: event.title,
    present: roster.present,
    absent: roster.absent.filter((person) => !onLeave.has(person.id)),
    pending: roster.pending.filter((person) => !onLeave.has(person.id)),
    onLeave: unanswered.filter((person) => onLeave.has(person.id)),
  }
}
