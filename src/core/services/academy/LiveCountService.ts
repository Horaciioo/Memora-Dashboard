import 'server-only'

import { countAccompaniedLives } from '@/core/lib/academy/lives'
import { prisma } from '@/core/lib/db'
import { AcademyJuniorStatuses, AcademySessionStatuses } from '@/utils/constants/hierarchy'
import type { LiveStatusName } from '@/utils/constants/lives'
import type { AttendanceStatusName } from '@/utils/constants/workflow'

/**
 * Recount the lives of every running junior among some accounts, the roll-call deciding
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

  // Every live these juniors were called on, with their answer
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

  return changed
}
