import 'server-only'

import { countAccompaniedLives } from '@/core/lib/academy/lives'
import { prisma } from '@/core/lib/db'
import type { AcademyScope } from '@/core/services/academy/AcademyScope'
import { notFound } from '@/core/lib/errors'
import { syncStages } from '@/core/services/academy/parkour/ParkourService'
import { AcademyJuniorStatuses, AcademySessionStatuses } from '@/utils/constants/hierarchy'
import type { JuniorLiveView } from '@/types/academy'
import { ACADEMY_SETTINGS } from '@/declarations/configurations/settings'
import { LiveStatuses } from '@/utils/constants/lives'
import type { LiveStatusName } from '@/utils/constants/lives'
import { AttendanceStatuses } from '@/utils/constants/workflow'
import type { AttendanceStatusName } from '@/utils/constants/workflow'
/**
 * Recount the lives of every running junior among some accounts
 * @param {string[]} accountIds - Accounts whose count may have moved
 * @return {Promise<string[]>} - Junior seats whose count changed
 */

export const syncJuniorLives = async (accountIds: string[]): Promise<string[]> => {
  if (accountIds.length === 0) return []

  const juniors = await prisma.academyJunior.findMany({
    where: {
      accountId: { in: accountIds },
      status: AcademyJuniorStatuses.Active,
      session: { status: AcademySessionStatuses.Running },
    },
    select: { id: true, accountId: true, startedAt: true, liveCount: true },
  })
  if (juniors.length === 0) return []

  // Every live these juniors were called on
  const answers = await prisma.eventAttendance.findMany({
    where: {
      accountId: { in: juniors.map((junior) => junior.accountId) },
      event: { live: { isNot: null } },
    },
    select: {
      accountId: true,
      status: true,
      event: { select: { live: { select: { status: true, startedAt: true } } } },
    },
  })

  const changed: string[] = []

  for (const junior of juniors) {
    const lives = answers
      .filter((answer) => answer.accountId === junior.accountId && answer.event.live)
      .map((answer) => ({
        status: answer.event.live?.status as LiveStatusName,
        startedAt: answer.event.live?.startedAt ?? null,
        attendance: answer.status as AttendanceStatusName,
      }))
    const count = countAccompaniedLives(lives, junior.startedAt)
    if (count === junior.liveCount) continue

    await prisma.academyJunior.update({ where: { id: junior.id }, data: { liveCount: count } })
    changed.push(junior.id)
  }

  // A threshold reached brings the check-in due
  await syncStages(changed)

  return changed
}

/**
 * Lives a junior was called on since their PIM started, whether they came or not
 * @param {string} juniorId - Junior seat
 * @param {AcademyScope} scope - Visibility fragment
 * @return {Promise<JuniorLiveView[]>} - Ended lives, newest first
 */

export const juniorLives = async (
  juniorId: string,
  scope: AcademyScope
): Promise<JuniorLiveView[]> => {
  const junior = await prisma.academyJunior.findFirst({
    where: { id: juniorId, session: scope.session, ...scope.juniors },
    select: { accountId: true, startedAt: true },
  })
  if (!junior) throw notFound()

  // Same window as the count: ended lives that started after the junior
  const rows = await prisma.live.findMany({
    where: {
      status: LiveStatuses.Ended,
      startedAt: { gte: junior.startedAt },
      calendarEvent: { attendances: { some: { accountId: junior.accountId } } },
    },
    select: {
      id: true,
      title: true,
      platform: true,
      startedAt: true,
      youtuber: { select: { name: true } },
      calendarEvent: {
        select: {
          attendances: {
            where: { accountId: junior.accountId },
            select: { status: true },
          },
        },
      },
    },
    orderBy: { startedAt: 'desc' },
    take: ACADEMY_SETTINGS.juniorLivesLimit,
  })

  return rows.map((row) => ({
    liveId: row.id,
    title: row.title,
    creator: row.youtuber.name,
    platform: row.platform,
    startedAt: (row.startedAt ?? new Date()).toISOString(),
    attendance: (row.calendarEvent?.attendances[0]?.status ??
      AttendanceStatuses.Pending) as AttendanceStatusName,
  }))
}
