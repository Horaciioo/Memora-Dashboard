import 'server-only'

import { countAccompaniedLives } from '@/core/lib/academy/lives'
import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import { syncStages } from '@/core/services/academy/ParkourService'
import { AcademyJuniorStatuses, AcademySessionStatuses } from '@/utils/constants/hierarchy'
import type { AccompaniedLiveView } from '@/types/academy'
import { LiveStatuses } from '@/utils/constants/lives'
import type { LiveStatusName } from '@/utils/constants/lives'
import { AttendanceStatuses } from '@/utils/constants/workflow'
import type { AttendanceStatusName } from '@/utils/constants/workflow'
import type { Prisma } from '@prisma/client'

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
 * Lives a junior was present on since their PIM started
 * @param {string} juniorId - Junior seat
 * @param {Prisma.AcademySessionWhereInput} scope - Visibility fragment
 * @return {Promise<AccompaniedLiveView[]>} - Lives
 */

export const accompaniedLives = async (
  juniorId: string,
  scope: Prisma.AcademySessionWhereInput
): Promise<AccompaniedLiveView[]> => {
  const junior = await prisma.academyJunior.findFirst({
    where: { id: juniorId, session: scope },
    select: { accountId: true, startedAt: true },
  })
  if (!junior) throw notFound()

  // Same rule as the count: ended, started after the junior, answered present
  const rows = await prisma.live.findMany({
    where: {
      status: LiveStatuses.Ended,
      startedAt: { gte: junior.startedAt },
      calendarEvent: {
        attendances: {
          some: { accountId: junior.accountId, status: AttendanceStatuses.Present },
        },
      },
    },
    select: {
      id: true,
      title: true,
      platform: true,
      startedAt: true,
      youtuber: { select: { name: true } },
    },
    orderBy: { startedAt: 'desc' },
  })

  return rows.map((row) => ({
    liveId: row.id,
    title: row.title,
    creator: row.youtuber.name,
    platform: row.platform,
    startedAt: (row.startedAt ?? new Date()).toISOString(),
  }))
}
