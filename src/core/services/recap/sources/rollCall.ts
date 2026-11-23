import 'server-only'

import { prisma } from '@/core/lib/db'
import { RECAP_SETTINGS } from '@/declarations/configurations/settings'
import type { RecapBeatName } from '@/declarations/recap/beats'
import type { RecapContext, RecapDraft } from '@/types/recap'
import { AttendanceStatuses } from '@/utils/constants/workflow'

// One beat per answer, so "present" and "absent" are told apart
const BEAT_OF_STATUS: Record<string, RecapBeatName> = {
  [AttendanceStatuses.Present]: 'rollCallPresent',
  [AttendanceStatuses.Absent]: 'rollCallAbsent',
}

/**
 * Answers given to the roll-calls the member runs, present and absent apart
 * @param {RecapContext} context - Member and window
 * @return {Promise<RecapDraft[]>} - Beats, one per roll-call and per answer
 */

export const readRollCallBeats = async ({
  accountId,
  since,
  until,
}: RecapContext): Promise<RecapDraft[]> => {
  const rows = await prisma.eventAttendance.findMany({
    where: {
      accountId: { not: accountId },
      status: { in: Object.keys(BEAT_OF_STATUS) as never },
      respondedAt: { gt: since, lte: until },
      event: { ownerId: accountId, rollCall: true },
    },
    select: {
      accountId: true,
      status: true,
      respondedAt: true,
      event: { select: { id: true, title: true } },
    },
    orderBy: { respondedAt: 'desc' },
    take: RECAP_SETTINGS.sourceTake,
  })

  const groups = Map.groupBy(rows, (row) => `${row.event.id}|${row.status}`)

  return [...groups.values()].map(([head, ...rest]) => ({
    beat: BEAT_OF_STATUS[head.status],
    at: head.respondedAt ?? until,
    actorIds: [head, ...rest].map((row) => row.accountId),
    count: rest.length + 1,
    target: 'calendar',
    targetId: head.event.id,
    subject: head.event.title,
  }))
}
